<?php
// app/Http/Controllers/Api/SaleController.php

namespace App\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use App\Http\Resources\SaleResource;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // parent::__construct();
        // $this->middleware('permission:sale-list', ['only' => ['index', 'show']]);
        // $this->middleware('permission:sale-create', ['only' => ['store']]);
        // $this->middleware('permission:sale-edit', ['only' => ['update']]);
        // $this->middleware('permission:sale-delete', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sales = Sale::with(['customer', 'user', 'saleItems.product'])->get();

        return SaleResource::collection($sales);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'in:cash,card,transfer'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:completed,pending,cancelled'],
        ]);

        // Get tax rate from settings
        $settings = Setting::first();
        $taxRate = $settings ? $settings->tax_rate : 0;

        // Calculate total amount
        $totalAmount = 0;
        $items = $request->items;

        foreach ($items as $item) {
            $subtotal = $item['price'] * $item['quantity'];
            if (isset($item['discount'])) {
                $subtotal -= $item['discount'];
            }
            $totalAmount += $subtotal;
        }

        // Apply discount
        if ($request->filled('discount')) {
            $totalAmount -= $request->discount;
        }

        // Apply tax
        $tax = $request->filled('tax') ? $request->tax : ($totalAmount * $taxRate / 100);
        $totalAmount += $tax;

        // Calculate change
        $change = $request->paid_amount - $totalAmount;
        if ($change < 0) {
            $change = 0;
        }

        // Generate invoice number
        $lastSale = Sale::latest()->first();
        $invoiceNumber = 'INV-' . date('Ymd') . sprintf('%04d', $lastSale ? ($lastSale->id + 1) : 1);

        // Create sale
        DB::beginTransaction();

        try {
            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'customer_id' => $request->customer_id,
                'user_id' => auth()->id(),
                'total_amount' => $totalAmount,
                'discount' => $request->discount ?? 0,
                'tax' => $tax,
                'paid_amount' => $request->paid_amount,
                'change' => $change,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'status' => $request->status ?? 'completed',
            ]);

            // Create sale items and update stock
            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Check stock
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Not enough stock for product: {$product->name}");
                }

                $subtotal = $item['price'] * $item['quantity'];
                if (isset($item['discount'])) {
                    $subtotal -= $item['discount'];
                }

                // Create sale item
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $subtotal,
                ]);

                // Update stock
                $product->stock -= $item['quantity'];
                $product->save();

                // Create stock movement
                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'user_id' => auth()->id(),
                    'quantity' => $item['quantity'],
                    'type' => 'out',
                    'sale_id' => $sale->id,
                    'notes' => 'Sale: ' . $invoiceNumber,
                ]);
            }

            DB::commit();

            $sale->load(['customer', 'user', 'saleItems.product']);

            return new SaleResource($sale);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        $sale->load(['customer', 'user', 'saleItems.product']);

        return new SaleResource($sale);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sale $sale)
    {
        // Only allow updating the status and notes of a sale
        $request->validate([
            'status' => ['required', 'string', 'in:completed,pending,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);

        // Check if the sale was already cancelled
        if ($sale->status === 'cancelled') {
            return response()->json([
                'message' => 'Cannot update a cancelled sale',
            ], 403);
        }

        // If cancelling the sale, restore the stock
        if ($request->status === 'cancelled' && $sale->status !== 'cancelled') {
            DB::beginTransaction();

            try {
                // Restore stock
                foreach ($sale->saleItems as $saleItem) {
                    $product = $saleItem->product;
                    $product->stock += $saleItem->quantity;
                    $product->save();

                    // Create stock movement
                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => auth()->id(),
                        'quantity' => $saleItem->quantity,
                        'type' => 'in',
                        'sale_id' => $sale->id,
                        'notes' => 'Sale cancelled: ' . $sale->invoice_number,
                    ]);
                }

                $sale->update([
                    'status' => $request->status,
                    'notes' => $request->notes ?? $sale->notes,
                ]);

                DB::commit();

                $sale->load(['customer', 'user', 'saleItems.product']);

                return new SaleResource($sale);
            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    'message' => $e->getMessage(),
                ], 400);
            }
        }

        // Regular status update
        $sale->update([
            'status' => $request->status,
            'notes' => $request->notes ?? $sale->notes,
        ]);

        $sale->load(['customer', 'user', 'saleItems.product']);

        return new SaleResource($sale);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        // Prevent deleting completed sales
        if ($sale->status === 'completed') {
            return response()->json([
                'message' => 'Cannot delete a completed sale',
            ], 403);
        }

        DB::beginTransaction();

        try {
            // Delete sale items
            $sale->saleItems()->delete();

            // Delete stock movements
            $sale->stockMovements()->delete();

            // Delete sale
            $sale->delete();

            DB::commit();

            return response()->json([
                'message' => 'Sale deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}