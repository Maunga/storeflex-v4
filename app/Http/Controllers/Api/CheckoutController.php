<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class CheckoutController extends Controller
{
    public function payment_methods()
    {
        try {
            $client = new Client([
                'base_uri' => 'https://www.dxbrunners.com',
                'headers' => [
                    'Authorization' => 'Basic Y2tfZDFmZmJiNThlY2VjZWEzOTVjOTAyOTU3MTU2ODE5MDdhM2U2MjE3ZDpjc18zZDBmODQ5MzExYWUwZWU3YzQyNTM0ODkyZWZkMzI3MmM0ZmIyMTU4',
                    'Content-Type' => 'application/json',
                ],
            ]);
            $response = $client->get("wp-json/wc/v3/payment_gateways");
            $responseBody = $response->getBody()->getContents();
            $paymentGateways = json_decode($responseBody, true);

            // Filter the payment gateways to return only those that are enabled (exclude PayPal)
            $enabledGateways = array_filter($paymentGateways, function ($gateway) {
                if (!isset($gateway['enabled']) || $gateway['enabled'] !== true || $gateway['title'] === '') {
                    return false;
                }

                $id = strtolower((string) ($gateway['id'] ?? ''));
                $title = strtolower((string) ($gateway['title'] ?? ''));

                return !str_contains($id, 'paypal') && !str_contains($title, 'paypal');
            });

            // Re-index array to remove keys
            $enabledGateways = array_values($enabledGateways);

            return response()->json($enabledGateways);
        } catch (GuzzleException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function agents()
    {
        try {
            $client = new Client([
                'base_uri' => 'https://www.dxbrunners.com',
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
            ]);
            $response = $client->get('agents.php');
            $responseBody = $response->getBody()->getContents();
            $agents = json_decode($responseBody, true);

            // Temporarily exclude specific agents
            $excluded = ['Purply Bot'];
            $agents = array_values(array_filter($agents ?: [], function ($agent) use ($excluded) {
                return !in_array($agent['display_name'] ?? '', $excluded);
            }));

            return response()->json($agents);
        } catch (GuzzleException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
