import { useState, useEffect, FormEvent } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import Toast from '@/Components/Toast';
import CartDrawer, { CartIcon } from '@/Components/CartDrawer';
import { useCart, CartItem } from '@/Contexts/CartContext';
import axios from 'axios';

interface CartPageProps extends PageProps {
    savedCheckoutData?: {
        shipping: any | null;
        billing: any | null;
    };
}

interface Agent {
    ID: string;
    display_name: string;
}

interface PaymentMethod {
    id: string;
    title: string;
    description: string;
    icon?: string;
    type?: 'cash' | 'mobile_push' | 'redirect';
    requires_phone?: boolean;
}

interface ShippingInfo {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
}

export default function Cart({ auth, savedCheckoutData }: CartPageProps) {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
    const [step, setStep] = useState<'cart' | 'shipping' | 'billing' | 'payment'>('cart');
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('info');
    const [orderSuccess, setOrderSuccess] = useState<any>(null);
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup');
    const [shippingSpeed] = useState<'regular' | 'express'>('regular');
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [currentProcessingItem, setCurrentProcessingItem] = useState<number>(0);
    
    const shippingFee = shippingSpeed === 'express' ? 5 * items.length : 0;
    const totalPrice = getTotal() + shippingFee;

    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        first_name: savedCheckoutData?.shipping?.first_name || '',
        last_name: savedCheckoutData?.shipping?.last_name || '',
        address_1: savedCheckoutData?.shipping?.address_1 || '',
        address_2: savedCheckoutData?.shipping?.address_2 || '',
        city: savedCheckoutData?.shipping?.city || '',
        state: savedCheckoutData?.shipping?.state || '',
        postcode: savedCheckoutData?.shipping?.postcode || '263',
        country: savedCheckoutData?.shipping?.country || 'ZW',
        email: savedCheckoutData?.shipping?.email || auth?.user?.email || '',
        phone: savedCheckoutData?.shipping?.phone || '',
    });

    const [billingInfo, setBillingInfo] = useState<ShippingInfo>({
        first_name: savedCheckoutData?.billing?.first_name || '',
        last_name: savedCheckoutData?.billing?.last_name || '',
        address_1: savedCheckoutData?.billing?.address_1 || '',
        address_2: savedCheckoutData?.billing?.address_2 || '',
        city: savedCheckoutData?.billing?.city || '',
        state: savedCheckoutData?.billing?.state || '',
        postcode: savedCheckoutData?.billing?.postcode || '263',
        country: savedCheckoutData?.billing?.country || 'ZW',
        email: savedCheckoutData?.billing?.email || auth?.user?.email || '',
        phone: savedCheckoutData?.billing?.phone || '',
    });

    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [saveProfile, setSaveProfile] = useState(!!auth?.user);
    const [ecocashPhone, setEcocashPhone] = useState('');

    useEffect(() => {
        loadAgentsAndPaymentMethods();
    }, []);

    async function loadAgentsAndPaymentMethods() {
        try {
            const [agentsResponse, paymentMethodsResponse] = await Promise.all([
                axios.get('/api/checkout/agents'),
                axios.get('/api/payments/methods')
            ]);
            
            setAgents(agentsResponse.data || []);
            setPaymentMethods(paymentMethodsResponse.data || []);
            
            if (agentsResponse.data?.length > 0) setSelectedAgent(agentsResponse.data[0]);
            if (paymentMethodsResponse.data?.length > 0) setSelectedPaymentMethod(paymentMethodsResponse.data[0]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    const handleContinueToShipping = () => {
        if (items.length === 0) {
            setToastType('error');
            setToastMessage('Your cart is empty');
            return;
        }
        setStep('shipping');
    };

    const handleShippingSubmit = (e: FormEvent) => {
        e.preventDefault();
        setStep('billing');
    };

    const handleBillingSubmit = (e: FormEvent) => {
        e.preventDefault();
        setStep('payment');
    };

    const handlePlaceOrder = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedAgent || !selectedPaymentMethod) {
            setToastType('error');
            setToastMessage('Please select an agent and payment method');
            return;
        }

        if (selectedPaymentMethod.requires_phone && !ecocashPhone) {
            setToastType('error');
            setToastMessage('Please enter your EcoCash phone number');
            return;
        }

        setLoading(true);
        setCurrentProcessingItem(0);

        try {
            // Process each cart item as a separate order
            const orders: any[] = [];

            for (let i = 0; i < items.length; i++) {
                setCurrentProcessingItem(i + 1);
                const item = items[i];

                const checkoutData = {
                    asin: item.asin,
                    quantity: item.quantity,
                    delivery_method: deliveryMethod,
                    shipping: shippingInfo,
                    billing: sameAsShipping ? shippingInfo : billingInfo,
                    extras: {
                        payment_method: {
                            id: selectedPaymentMethod!.id,
                            title: selectedPaymentMethod!.title,
                        },
                        agent: {
                            ID: selectedAgent!.ID,
                            display_name: selectedAgent!.display_name,
                        },
                        shipping_speed: {
                            id: shippingSpeed,
                            title: shippingSpeed === 'express' ? 'Express' : 'Regular',
                            fee: shippingSpeed === 'express' ? 5 : 0,
                        },
                        payment_percentage: 100,
                    },
                };

                // For cash payments, process directly
                if (selectedPaymentMethod!.type === 'cash') {
                    const response = await axios.post('/api/checkout/process', checkoutData);

                    if (response.data.success) {
                        orders.push({
                            item,
                            order: response.data.data?.order,
                            wooOrderId: response.data.data?.woocommerce_order_id,
                        });
                    } else {
                        throw new Error(response.data.message || `Failed to process order for ${item.title}`);
                    }
                } else {
                    // For non-cash payments, we need a different flow
                    // For now, we'll still process as cash and handle payment separately
                    const response = await axios.post('/api/checkout/process', checkoutData);

                    if (response.data.success) {
                        orders.push({
                            item,
                            order: response.data.data?.order,
                            wooOrderId: response.data.data?.woocommerce_order_id,
                        });
                    } else {
                        throw new Error(response.data.message || `Failed to process order for ${item.title}`);
                    }
                }
            }

            // Save checkout profile if user is logged in
            if (auth?.user && saveProfile) {
                try {
                    await axios.post('/checkout/save-profile', {
                        shipping: shippingInfo,
                        billing: sameAsShipping ? shippingInfo : billingInfo,
                    });
                } catch (error) {
                    console.error('Failed to save profile:', error);
                }
            }

            setOrderSuccess({
                orders,
                total: totalPrice,
                paymentMethod: selectedPaymentMethod!.title,
                deliveryMethod,
                shipping: shippingInfo,
                billing: sameAsShipping ? shippingInfo : billingInfo,
            });

            // Clear cart after successful orders
            clearCart();

        } catch (error: any) {
            setToastType('error');
            setToastMessage(error.response?.data?.message || error.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
            setCurrentProcessingItem(0);
        }
    };

    // Success screen
    if (orderSuccess) {
        return (
            <>
                <Head title="Orders Placed Successfully" />

                <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                                <img src="/images/logo.png" alt="Storeflex" className="h-8 w-auto" />
                            </Link>
                        </div>
                    </header>

                    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sm:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-700 dark:text-[#86efac]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        Order Placed Successfully
                                    </h1>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Thanks for your purchase. We are processing your orders now.
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-4 mb-6">
                                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Order Summary</h2>
                                {orderSuccess.orders.map((order: any, index: number) => (
                                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                        <img
                                            src={order.item.image}
                                            alt={order.item.title}
                                            className="w-16 h-16 rounded-lg object-contain bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
                                                {order.item.title}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Qty: {order.item.quantity} &middot; Order #{order.order?.id ?? 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            ${(order.item.dxbPrice * order.item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 mb-6">
                                <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
                                <span className="text-lg font-bold text-emerald-700 dark:text-[#86efac]">
                                    ${orderSuccess.total.toFixed(2)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {auth?.user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                                        >
                                            View Dashboard
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            View Order History
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href="/"
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                                    >
                                        Continue Shopping
                                    </Link>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Cart" />
            <Toast message={toastMessage} type={toastType} onDismiss={() => setToastMessage(null)} />
            <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-white/60 dark:bg-neutral-950/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 animate-fade-in">
                        <div className="w-10 h-10 border-4 border-neutral-200 border-t-emerald-500 rounded-full animate-spin" />
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {currentProcessingItem > 0 
                                ? `Processing order ${currentProcessingItem} of ${items.length}...` 
                                : 'Processing...'}
                        </span>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                {/* Header */}
                <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                            <img src="/images/logo.png" alt="Storeflex" className="h-8 w-auto" />
                        </Link>
                        <div className="flex items-center gap-3">
                            {auth?.user && (
                                <span className="text-sm text-neutral-600 dark:text-neutral-400 hidden sm:block">
                                    {auth.user.email}
                                </span>
                            )}
                            <CartIcon onClick={() => setIsCartDrawerOpen(true)} />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    {step === 'cart' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6">
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                        Your Cart ({items.length} item{items.length !== 1 ? 's' : ''})
                                    </h1>

                                    {items.length === 0 ? (
                                        <div className="text-center py-12">
                                            <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <circle cx="9" cy="21" r="1" />
                                                <circle cx="20" cy="21" r="1" />
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                            </svg>
                                            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Your cart is empty</p>
                                            <Link
                                                href="/"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                                            >
                                                Start Shopping
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map((item) => (
                                                <CartItemRow
                                                    key={item.asin}
                                                    item={item}
                                                    onRemove={() => removeItem(item.asin)}
                                                    onUpdateQuantity={(qty) => updateQuantity(item.asin, qty)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sticky top-8">
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Order Summary</h2>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                            <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                                            <span>${getTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                            <span>Shipping</span>
                                            <span>{shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : 'Free'}</span>
                                        </div>
                                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                                            <div className="flex justify-between font-semibold text-neutral-900 dark:text-white">
                                                <span>Total</span>
                                                <span className="text-emerald-700 dark:text-[#86efac]">${totalPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleContinueToShipping}
                                        disabled={items.length === 0}
                                        className="w-full mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:text-neutral-900 dark:hover:bg-emerald-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Proceed to Checkout
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </button>

                                    <Link
                                        href="/"
                                        className="w-full mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="19" y1="12" x2="5" y2="12" />
                                            <polyline points="12 19 5 12 12 5" />
                                        </svg>
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Checkout Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6">
                                    {/* Back Button */}
                                    <button
                                        onClick={() => setStep(step === 'payment' ? 'billing' : step === 'billing' ? 'shipping' : 'cart')}
                                        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="19" y1="12" x2="5" y2="12" />
                                            <polyline points="12 19 5 12 12 5" />
                                        </svg>
                                        Back
                                    </button>

                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                                        {step === 'shipping' && 'Shipping Information'}
                                        {step === 'billing' && 'Billing Information'}
                                        {step === 'payment' && 'Payment'}
                                    </h1>

                                    {/* Shipping Form */}
                                    {step === 'shipping' && (
                                        <form onSubmit={handleShippingSubmit} className="space-y-4">
                                            {/* Delivery Method */}
                                            <div className="mb-6">
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">Delivery Method</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeliveryMethod('pickup')}
                                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                                            deliveryMethod === 'pickup'
                                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                                : 'border-neutral-200 dark:border-neutral-700'
                                                        }`}
                                                    >
                                                        <p className="font-medium text-neutral-900 dark:text-white">Pickup</p>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Free</p>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeliveryMethod('delivery')}
                                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                                            deliveryMethod === 'delivery'
                                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                                : 'border-neutral-200 dark:border-neutral-700'
                                                        }`}
                                                    >
                                                        <p className="font-medium text-neutral-900 dark:text-white">Delivery</p>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">To your address</p>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">First Name *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={shippingInfo.first_name}
                                                        onChange={(e) => setShippingInfo({ ...shippingInfo, first_name: e.target.value })}
                                                        className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Last Name *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={shippingInfo.last_name}
                                                        onChange={(e) => setShippingInfo({ ...shippingInfo, last_name: e.target.value })}
                                                        className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={shippingInfo.email}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone *</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={shippingInfo.phone}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    {deliveryMethod === 'pickup' ? 'Pickup City *' : 'Address *'}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingInfo.city}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    placeholder={deliveryMethod === 'pickup' ? 'e.g., Harare, Bulawayo' : 'Street address'}
                                                />
                                            </div>

                                            {deliveryMethod === 'delivery' && (
                                                <>
                                                    <div>
                                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Address Line 1 *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={shippingInfo.address_1}
                                                            onChange={(e) => setShippingInfo({ ...shippingInfo, address_1: e.target.value })}
                                                            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Address Line 2</label>
                                                        <input
                                                            type="text"
                                                            value={shippingInfo.address_2}
                                                            onChange={(e) => setShippingInfo({ ...shippingInfo, address_2: e.target.value })}
                                                            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            <button
                                                type="submit"
                                                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:text-neutral-900 dark:hover:bg-emerald-400 rounded-lg transition-colors"
                                            >
                                                Continue to Billing
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </button>
                                        </form>
                                    )}

                                    {/* Billing Form */}
                                    {step === 'billing' && (
                                        <form onSubmit={handleBillingSubmit} className="space-y-4">
                                            <label className="flex items-center gap-2 mb-4">
                                                <input
                                                    type="checkbox"
                                                    checked={sameAsShipping}
                                                    onChange={(e) => setSameAsShipping(e.target.checked)}
                                                    className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span className="text-sm text-neutral-700 dark:text-neutral-300">Same as shipping information</span>
                                            </label>

                                            {!sameAsShipping && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">First Name *</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={billingInfo.first_name}
                                                                onChange={(e) => setBillingInfo({ ...billingInfo, first_name: e.target.value })}
                                                                className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Last Name *</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={billingInfo.last_name}
                                                                onChange={(e) => setBillingInfo({ ...billingInfo, last_name: e.target.value })}
                                                                className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email *</label>
                                                        <input
                                                            type="email"
                                                            required
                                                            value={billingInfo.email}
                                                            onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                                                            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone *</label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={billingInfo.phone}
                                                            onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                                                            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            <button
                                                type="submit"
                                                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:text-neutral-900 dark:hover:bg-emerald-400 rounded-lg transition-colors"
                                            >
                                                Continue to Payment
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </button>
                                        </form>
                                    )}

                                    {/* Payment Form */}
                                    {step === 'payment' && (
                                        <form onSubmit={handlePlaceOrder} className="space-y-6">
                                            {/* Agent Selection */}
                                            <div>
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">Select Agent</label>
                                                <div className="space-y-2">
                                                    {agents.map((agent) => (
                                                        <button
                                                            key={agent.ID}
                                                            type="button"
                                                            onClick={() => setSelectedAgent(agent)}
                                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                                                selectedAgent?.ID === agent.ID
                                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                                                            }`}
                                                        >
                                                            <p className="font-medium text-neutral-900 dark:text-white">{agent.display_name}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Method Selection */}
                                            <div>
                                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">Payment Method</label>
                                                <div className="space-y-2">
                                                    {paymentMethods.map((method) => (
                                                        <button
                                                            key={method.id}
                                                            type="button"
                                                            onClick={() => setSelectedPaymentMethod(method)}
                                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                                                selectedPaymentMethod?.id === method.id
                                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                                                            }`}
                                                        >
                                                            <p className="font-medium text-neutral-900 dark:text-white">{method.title}</p>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{method.description}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* EcoCash Phone */}
                                            {selectedPaymentMethod?.requires_phone && (
                                                <div>
                                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">EcoCash Phone Number *</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={ecocashPhone}
                                                        onChange={(e) => setEcocashPhone(e.target.value)}
                                                        placeholder="07XXXXXXXX"
                                                        className="w-full mt-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )}

                                            {/* Save Profile */}
                                            {auth?.user && (
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={saveProfile}
                                                        onChange={(e) => setSaveProfile(e.target.checked)}
                                                        className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Save my details for faster checkout</span>
                                                </label>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:text-neutral-900 dark:hover:bg-emerald-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Place Order ({items.length} item{items.length !== 1 ? 's' : ''}) - ${totalPrice.toFixed(2)}
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sticky top-8">
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Order Summary</h2>

                                    {/* Items Preview */}
                                    <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                                        {items.map((item) => (
                                            <div key={item.asin} className="flex gap-3">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-12 h-12 rounded-lg object-contain bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-neutral-900 dark:text-white line-clamp-2">{item.title}</p>
                                                    <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-xs font-medium text-neutral-900 dark:text-white">${(item.dxbPrice * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 text-sm border-t border-neutral-200 dark:border-neutral-700 pt-4">
                                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                            <span>Subtotal</span>
                                            <span>${getTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                            <span>Shipping</span>
                                            <span>{shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : 'Free'}</span>
                                        </div>
                                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                                            <div className="flex justify-between font-semibold text-neutral-900 dark:text-white">
                                                <span>Total</span>
                                                <span className="text-emerald-700 dark:text-[#86efac]">${totalPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

interface CartItemRowProps {
    item: CartItem;
    onRemove: () => void;
    onUpdateQuantity: (quantity: number) => void;
}

function CartItemRow({ item, onRemove, onUpdateQuantity }: CartItemRowProps) {
    return (
        <div className="flex gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <Link href={`/product/${item.asin}`} className="flex-shrink-0">
                <div className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain p-2"
                    />
                </div>
            </Link>

            <div className="flex-1 min-w-0">
                <Link href={`/product/${item.asin}`}>
                    <h3 className="font-medium text-neutral-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-[#86efac] transition-colors">
                        {item.title}
                    </h3>
                </Link>
                {item.brand && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{item.brand}</p>
                )}
                <p className="text-lg font-semibold text-emerald-700 dark:text-[#86efac] mt-2">
                    ${item.dxbPrice.toFixed(2)}
                </p>

                <div className="flex items-center gap-4 mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onUpdateQuantity(item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white w-8 text-center">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>

                    {/* Remove Button */}
                    <button
                        onClick={onRemove}
                        className="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {/* Item Total */}
            <div className="text-right">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total</p>
                <p className="font-semibold text-neutral-900 dark:text-white">
                    ${(item.dxbPrice * item.quantity).toFixed(2)}
                </p>
            </div>
        </div>
    );
}
