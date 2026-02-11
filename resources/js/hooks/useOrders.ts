import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface ShippingInfo {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    email: string;
    phone: string;
}

interface BillingInfo {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    email: string;
    phone: string;
}

interface Extras {
    payment_method: {
        id: string;
        title: string;
    };
    agent: {
        ID: string;
        display_name: string;
    };
}

export function useOrders() {
    const { auth } = usePage<PageProps>().props;
    const authenticated = !!auth?.user;

    async function fetchShoppingCart(): Promise<any> {
        try {
            const response = await axios.get('/api/cart');
            return response.data;
        } catch (error) {
            console.error('Error fetching shopping cart:', error);
            throw error;
        }
    }

    async function fetchAgents(): Promise<any> {
        try {
            const response = await axios.get('https://www.dxbrunners.com/agents.php');
            return response.data;
        } catch (error) {
            console.error('Error fetching agents:', error);
            throw error;
        }
    }

    async function fetchPaymentMethods(): Promise<any> {
        try {
            const response = await axios.get('/api/checkout/payment-methods');
            return response.data;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    }

    async function placeOrder(
        url: string,
        shipping: ShippingInfo,
        billing: BillingInfo,
        extras: Extras,
        attemptId: string
    ): Promise<any> {
        const body = {
            extras,
            billing: {
                first_name: billing.firstName,
                last_name: billing.lastName,
                address_1: billing.address,
                city: billing.city,
                country: billing.country,
                email: billing.email,
                phone: billing.phone,
            },
            shipping: {
                first_name: shipping.firstName,
                last_name: shipping.lastName,
                address_1: shipping.address,
                city: shipping.city,
                postcode: '263',
                country: shipping.country,
                email: shipping.email,
                phone: shipping.phone,
            },
            attempt_id: attemptId,
        };

        console.log('extras', extras);

        try {
            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    }

    async function place(
        shipping: ShippingInfo,
        billing: BillingInfo,
        extras: Extras,
        attemptId: string
    ): Promise<any> {
        if (authenticated) {
            return await placeOrder('/api/orders', shipping, billing, extras, attemptId);
        }
        return await placeOrder('/api/orders/place', shipping, billing, extras, attemptId);
    }

    return {
        place,
        fetchAgents,
        fetchPaymentMethods,
        fetchShoppingCart,
    };
}
