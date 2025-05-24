<?php
// app/Http/Controllers/Api/ProductController.php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Routing\Controller;


class ProductController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // parent::__construct();
        // $this->middleware('permission:product-list', ['only' => ['index', 'show']]);
        // $this->middleware('permission:product-create', ['only' => ['store']]);
        // $this->middleware('permission:product-edit', ['only' => ['update']]);
        // $this->middleware('permission:product-delete', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('category')->get();

        return ProductResource::collection($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:products'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'alert_stock' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'category_id' => ['required', 'exists:categories,id'],
            'is_active' => ['boolean'],
        ]);

        $productData = [
            'name' => $request->name,
            'code' => $request->code,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'price' => $request->price,
            'cost' => $request->cost,
            'stock' => $request->stock,
            'alert_stock' => $request->alert_stock,
            'category_id' => $request->category_id,
            'is_active' => $request->is_active ?? true,
        ];

        if ($request->hasFile('image')) {
            $productData['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($productData);

        // Add stock movement
        if ($request->stock > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'quantity' => $request->stock,
                'type' => 'in',
                'notes' => 'Initial stock',
            ]);
        }

        return new ProductResource($product);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load('category');

        return new ProductResource($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('products')->ignore($product->id),
            ],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'alert_stock' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'is_active' => ['boolean'],
        ]);

        $productData = [
            'description' => $request->description ?? $product->description,
            'price' => $request->price ?? $product->price,
            'cost' => $request->cost ?? $product->cost,
            'alert_stock' => $request->alert_stock ?? $product->alert_stock,
            'category_id' => $request->category_id ?? $product->category_id,
            'is_active' => $request->is_active ?? $product->is_active,
        ];

        if ($request->filled('name')) {
            $productData['name'] = $request->name;
            $productData['slug'] = Str::slug($request->name);
        }

        if ($request->filled('code')) {
            $productData['code'] = $request->code;
        }

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $productData['image'] = $request->file('image')->store('products', 'public');
        }

        // Check if stock has changed
        if ($request->filled('stock') && $request->stock != $product->stock) {
            $difference = $request->stock - $product->stock;
            $type = $difference > 0 ? 'in' : 'out';

            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'quantity' => abs($difference),
                'type' => $type,
                'notes' => 'Stock adjustment',
            ]);

            $productData['stock'] = $request->stock;
        }

        $product->update($productData);

        return new ProductResource($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Check if product has sale items
        if ($product->saleItems()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete product with sales',
            ], 403);
        }

        // Delete image
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        // Delete stock movements
        $product->stockMovements()->delete();

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}