<?php

namespace App\Interfaces;

interface PaymentGatewayInterface
{
    /**
     * Get the gateway identifier
     */
    public function getIdentifier(): string;

    /**
     * Get the display name
     */
    public function getName(): string;

    /**
     * Check if this gateway supports mobile push (USSD) payments
     */
    public function supportsMobilePush(): bool;

    /**
     * Check if this gateway requires redirect to external page
     */
    public function requiresRedirect(): bool;

    /**
     * Initialize a payment
     *
     * @param array $orderData Order details including amount, reference, customer info
     * @return array Response with success status and payment details (url, poll_url, etc.)
     */
    public function initiate(array $orderData): array;

    /**
     * Check the status of a payment
     *
     * @param string $pollUrl The URL or reference to check payment status
     * @return array Response with status and payment details
     */
    public function checkStatus(string $pollUrl): array;

    /**
     * Handle webhook/callback from payment provider
     *
     * @param array $payload The webhook payload
     * @return array Response with processing result
     */
    public function handleCallback(array $payload): array;
}
