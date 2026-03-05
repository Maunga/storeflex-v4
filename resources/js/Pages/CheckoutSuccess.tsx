import { Head, Link } from '@inertiajs/react';

// Inline SVG icons
const CheckCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Package = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

interface Order {
    id: number;
    total: number;
    currency: string;
    amount_paid: number;
    status: string;
}

interface Props {
    reference: string | null;
    provider: string | null;
    order: Order | null;
}

export default function CheckoutSuccess({ reference, provider, order }: Props) {
    const providerLabels: Record<string, string> = {
        ecocash: 'EcoCash',
        paynow: 'Paynow',
        paypal: 'PayPal',
        stripe: 'Stripe',
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(amount);
    };

    return (
        <>
            <Head title="Payment Successful" />

            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment Successful!
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Thank you for your order. Your payment has been processed successfully
                        {provider && ` via ${providerLabels[provider] || provider}`}.
                    </p>

                    {order && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="font-medium">#{order.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-medium">
                                        {formatCurrency(order.total, order.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount Paid:</span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(order.amount_paid, order.currency)}
                                    </span>
                                </div>
                                {order.amount_paid < order.total && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Remaining Balance:</span>
                                        <span className="font-medium text-orange-600">
                                            {formatCurrency(order.total - order.amount_paid, order.currency)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium capitalize ${
                                        order.status === 'processing' ? 'text-green-600' :
                                        order.status === 'partially-paid' ? 'text-orange-600' :
                                        'text-gray-900'
                                    }`}>
                                        {order.status?.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {reference && (
                        <p className="text-sm text-gray-500 mb-6">
                            Reference: <span className="font-mono">{reference}</span>
                        </p>
                    )}

                    <p className="text-sm text-gray-600 mb-6">
                        You will receive an email confirmation shortly with your order details.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                            Continue Shopping
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-sm text-gray-500">
                    Need help?{' '}
                    <a href="mailto:support@storeflex.co.zw" className="text-orange-600 hover:underline">
                        Contact Support
                    </a>
                </p>
            </div>
        </>
    );
}
