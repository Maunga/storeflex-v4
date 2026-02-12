<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $orders = Order::with(['purchased_items.product', 'billing_details', 'shipping_details'])
            ->where('user_id', $user->id)
            ->orWhereHas('billing_details', function ($query) use ($user) {
                $query->where('email', $user->email);
            })
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Orders', [
            'orders' => $orders,
        ]);
    }
}
