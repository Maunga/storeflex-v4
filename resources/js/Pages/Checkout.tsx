import { useState, useEffect, useRef, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps, ProductData } from '@/types';
import Toast from '@/Components/Toast';
import axios from 'axios';

interface CheckoutPageProps extends PageProps {
    product: ProductData;
    identifier: string;
    savedCheckoutData: {
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

interface OrderSuccessSummary {
    orderId: number | null;
    wooOrderId: number | string | null;
    total: number | null;
    paymentMethod: string;
    deliveryMethod: string;
    shipping: ShippingInfo;
    billing: ShippingInfo;
    quantity: number;
    productTitle: string;
    productImage: string;
}

export default function Checkout({ auth, product, identifier, savedCheckoutData }: CheckoutPageProps) {
    const [step, setStep] = useState<'shipping' | 'billing' | 'payment'>('shipping');
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('info');
    const [orderSuccess, setOrderSuccess] = useState<OrderSuccessSummary | null>(null);
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup');
    const [shippingSpeed, setShippingSpeed] = useState<'regular' | 'express'>('regular');

    const basePrice = parseFloat(String(product.dxb_price ?? product.price ?? 0)) || 0;
    const shippingFee = shippingSpeed === 'express' ? 5 : 0;
    const totalPrice = basePrice + shippingFee;
    
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        first_name: savedCheckoutData.shipping?.first_name || '',
        last_name: savedCheckoutData.shipping?.last_name || '',
        address_1: savedCheckoutData.shipping?.address_1 || '',
        address_2: savedCheckoutData.shipping?.address_2 || '',
        city: savedCheckoutData.shipping?.city || '',
        state: savedCheckoutData.shipping?.state || '',
        postcode: savedCheckoutData.shipping?.postcode || '263',
        country: savedCheckoutData.shipping?.country || 'ZW',
        email: savedCheckoutData.shipping?.email || auth?.user?.email || '',
        phone: savedCheckoutData.shipping?.phone || '',
    });
    
    const [billingInfo, setBillingInfo] = useState<ShippingInfo>({
        first_name: savedCheckoutData.billing?.first_name || '',
        last_name: savedCheckoutData.billing?.last_name || '',
        address_1: savedCheckoutData.billing?.address_1 || '',
        address_2: savedCheckoutData.billing?.address_2 || '',
        city: savedCheckoutData.billing?.city || '',
        state: savedCheckoutData.billing?.state || '',
        postcode: savedCheckoutData.billing?.postcode || '263',
        country: savedCheckoutData.billing?.country || 'ZW',
        email: savedCheckoutData.billing?.email || auth?.user?.email || '',
        phone: savedCheckoutData.billing?.phone || '',
    });
    
    const [sameAsShipping, setSameAsShipping] = useState(
        savedCheckoutData.billing ? 
        JSON.stringify(savedCheckoutData.shipping) === JSON.stringify(savedCheckoutData.billing) :
        true
    );
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [saveProfile, setSaveProfile] = useState(!!auth?.user);
    
    // Express checkout for returning customers
    const hasSavedDetails = Boolean(
        savedCheckoutData.shipping?.first_name && 
        savedCheckoutData.shipping?.last_name && 
        savedCheckoutData.shipping?.phone &&
        savedCheckoutData.shipping?.email
    );
    const [useExpressCheckout, setUseExpressCheckout] = useState(hasSavedDetails);
    const [showSavedDetailsCard, setShowSavedDetailsCard] = useState(hasSavedDetails);
    const prevShippingContactRef = useRef({
        first_name: shippingInfo.first_name,
        last_name: shippingInfo.last_name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
    });

    useEffect(() => {
        loadAgentsAndPaymentMethods();
    }, []);

    useEffect(() => {
        const prevContact = prevShippingContactRef.current;

        setBillingInfo((prev) => {
            const updates: Partial<ShippingInfo> = {};

            if (prev.first_name === prevContact.first_name) {
                updates.first_name = shippingInfo.first_name;
            }
            if (prev.last_name === prevContact.last_name) {
                updates.last_name = shippingInfo.last_name;
            }
            if (prev.email === prevContact.email) {
                updates.email = shippingInfo.email;
            }
            if (prev.phone === prevContact.phone) {
                updates.phone = shippingInfo.phone;
            }

            if (Object.keys(updates).length === 0) {
                return prev;
            }

            return { ...prev, ...updates };
        });

        prevShippingContactRef.current = {
            first_name: shippingInfo.first_name,
            last_name: shippingInfo.last_name,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
        };
    }, [shippingInfo.first_name, shippingInfo.last_name, shippingInfo.email, shippingInfo.phone]);

    useEffect(() => {
        if (deliveryMethod === 'pickup' && sameAsShipping) {
            setSameAsShipping(false);
        }
    }, [deliveryMethod, sameAsShipping]);

    async function loadAgentsAndPaymentMethods() {
        try {
            const [agentsResponse, paymentMethodsResponse] = await Promise.all([
                axios.get('/api/checkout/agents'),
                axios.get('/api/checkout/payment-methods')
            ]);
            const agentsData = agentsResponse.data;
            const paymentMethodsData = paymentMethodsResponse.data;
            
            setAgents(agentsData || []);
            setPaymentMethods(paymentMethodsData || []);
            
            if (agentsData?.length > 0) setSelectedAgent(agentsData[0]);
            if (paymentMethodsData?.length > 0) setSelectedPaymentMethod(paymentMethodsData[0]);
        } catch (error) {
            console.error('Error loading data:', error);
            setToastType('error');
            setToastMessage('Failed to load checkout data');
        }
    }

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

        setLoading(true);
        try {
            // Prepare checkout data for unified API
            const checkoutData = {
                asin: identifier,
                quantity: 1,
                delivery_method: deliveryMethod,
                shipping: shippingInfo,
                billing: sameAsShipping ? shippingInfo : billingInfo,
                extras: {
                    payment_method: {
                        id: selectedPaymentMethod.id,
                        title: selectedPaymentMethod.title,
                    },
                    agent: {
                        ID: selectedAgent.ID,
                        display_name: selectedAgent.display_name,
                    },
                    shipping_speed: {
                        id: shippingSpeed,
                        title: shippingSpeed === 'express' ? 'Express' : 'Regular',
                        fee: shippingFee,
                    },
                },
            };

            // Save checkout profile if user is logged in and checkbox is checked
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

            // Call unified checkout API (uploads to WooCommerce + creates order)
            const response = await axios.post('/api/checkout/process', checkoutData);

            if (response.data.success) {
                setToastType('success');
                setToastMessage('Order placed successfully!');

                const orderData = response.data.data?.order ?? null;
                setOrderSuccess({
                    orderId: orderData?.id ?? null,
                    wooOrderId: response.data.data?.woocommerce_order_id ?? null,
                    total: orderData?.total ?? null,
                    paymentMethod: selectedPaymentMethod.title,
                    deliveryMethod,
                    shipping: shippingInfo,
                    billing: sameAsShipping ? shippingInfo : billingInfo,
                    quantity: checkoutData.quantity,
                    productTitle: product.title ?? 'Order Item',
                    productImage: product.images?.[0] ?? '/placeholder.png',
                });
            } else {
                throw new Error(response.data.message || 'Order failed');
            }
        } catch (error: any) {
            setToastType('error');
            setToastMessage(error.response?.data?.message || error.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <>
                <Head title="Order Successful" />

                <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                                <img src="/images/logo.png" alt="Storeflex" className="h-8 w-auto" />
                            </Link>
                            {auth?.user && (
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {auth.user.email}
                                </span>
                            )}
                        </div>
                    </header>

                    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-emerald-700 dark:text-[#86efac]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Order successfully placed</h1>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Thanks for your purchase. We are processing your order now.</p>
                                    </div>
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {orderSuccess.orderId != null && (
                                        <div>Order #{orderSuccess.orderId}</div>
                                    )}
                                    {orderSuccess.wooOrderId != null && (
                                        <div>WooCommerce #{orderSuccess.wooOrderId}</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Order summary</h2>
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={orderSuccess.productImage}
                                                alt={orderSuccess.productTitle}
                                                className="w-16 h-16 rounded-lg object-contain bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                    {orderSuccess.productTitle}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Qty: {orderSuccess.quantity}</p>
                                            </div>
                                            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {orderSuccess.total != null ? `AED ${orderSuccess.total}` : 'Paid'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Shipping</h3>
                                            <p className="text-sm text-neutral-900 dark:text-white">
                                                {orderSuccess.shipping.first_name} {orderSuccess.shipping.last_name}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {orderSuccess.shipping.address_1 || 'Pickup order'}
                                            </p>
                                            {orderSuccess.shipping.city && (
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {orderSuccess.shipping.city} {orderSuccess.shipping.postcode}
                                                </p>
                                            )}
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {orderSuccess.shipping.email}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Billing</h3>
                                            <p className="text-sm text-neutral-900 dark:text-white">
                                                {orderSuccess.billing.first_name} {orderSuccess.billing.last_name}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {orderSuccess.billing.address_1 || 'Pickup order'}
                                            </p>
                                            {orderSuccess.billing.city && (
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {orderSuccess.billing.city} {orderSuccess.billing.postcode}
                                                </p>
                                            )}
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {orderSuccess.billing.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Payment & delivery</h3>
                                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                        <div className="flex justify-between">
                                            <span>Payment</span>
                                            <span className="text-neutral-900 dark:text-white">{orderSuccess.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span>Delivery</span>
                                            <span className="text-neutral-900 dark:text-white">
                                                {orderSuccess.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span>Total</span>
                                            <span className="text-neutral-900 dark:text-white">
                                                {orderSuccess.total != null ? `AED ${orderSuccess.total}` : 'Paid'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
                                        {auth?.user ? (
                                            <Link
                                                href="/dashboard"
                                                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                                            >
                                                View dashboard
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/"
                                                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                                            >
                                                Back to home
                                            </Link>
                                        )}
                                        {auth?.user && (
                                            <Link
                                                href="/orders"
                                                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                            >
                                                View order history
                                            </Link>
                                        )}
                                        <Link
                                            href={`/product/${identifier}`}
                                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            Back to product
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Checkout" />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                {/* Header */}
                <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                            <img src="/images/logo.png" alt="Storeflex" className="h-8 w-auto" />
                        </Link>
                        {auth?.user && (
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {auth.user.email}
                            </span>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6">
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    {auth?.user ? 'Complete Your Purchase' : 'Guest Checkout'}
                                </h1>
                                {!auth?.user && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                                        Have an account? <Link href="/login" className="text-emerald-600 dark:text-[#86efac] hover:underline">Sign in</Link> for faster checkout
                                    </p>
                                )}

                                {/* Progress Steps */}
                                <div className="flex items-center justify-between mb-8 mt-6">
                                    {['shipping', 'billing', 'payment'].map((s, i) => {
                                        const stepNames = { shipping: 'Shipping', billing: 'Billing', payment: 'Payment' };
                                        const currentIndex = ['shipping', 'billing', 'payment'].indexOf(step);
                                        const isActive = step === s;
                                        const isComplete = i < currentIndex;
                                        
                                        return (
                                            <div key={s} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center">
                                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-colors ${
                                                        isActive
                                                            ? 'bg-[#86efac] text-neutral-900'
                                                            : isComplete
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                                                    }`}>
                                                        {isComplete ? (
                                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        ) : (
                                                            i + 1
                                                        )}
                                                    </div>
                                                    <span className={`text-xs mt-1 font-medium ${
                                                        isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'
                                                    }`}>
                                                        {stepNames[s as keyof typeof stepNames]}
                                                    </span>
                                                </div>
                                                {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${
                                                    isComplete ? 'bg-emerald-600' : 'bg-neutral-200 dark:bg-neutral-700'
                                                }`} />}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Shipping Form */}
                                {step === 'shipping' && (
                                    <>
                                        {/* Express Checkout Card for Returning Customers */}
                                        {showSavedDetailsCard && hasSavedDetails && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Welcome back!</h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Use your saved details for faster checkout</p>
                                                
                                                <div 
                                                    onClick={() => {
                                                        setUseExpressCheckout(true);
                                                        setStep('payment');
                                                    }}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                                                        useExpressCheckout 
                                                            ? 'border-[#86efac] bg-[#86efac]/10' 
                                                            : 'border-neutral-200 dark:border-neutral-700 hover:border-[#86efac]/50'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                                                <svg className="w-5 h-5 text-emerald-600 dark:text-[#86efac]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                                    <circle cx="12" cy="7" r="4" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-neutral-900 dark:text-white">
                                                                    {savedCheckoutData.shipping?.first_name} {savedCheckoutData.shipping?.last_name}
                                                                </p>
                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                    {savedCheckoutData.shipping?.email}
                                                                </p>
                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                    {savedCheckoutData.shipping?.phone}
                                                                </p>
                                                                {savedCheckoutData.shipping?.address_1 && (
                                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                                                        {savedCheckoutData.shipping?.address_1}, {savedCheckoutData.shipping?.city}, {savedCheckoutData.shipping?.country}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-emerald-600 dark:text-[#86efac] bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                                                Express
                                                            </span>
                                                            <svg className="w-5 h-5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="9 18 15 12 9 6" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowSavedDetailsCard(false);
                                                        setUseExpressCheckout(false);
                                                    }}
                                                    className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                    Enter different details
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* Show form if no saved details or user wants to enter new */}
                                        {(!showSavedDetailsCard || !hasSavedDetails) && (
                                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                                        {hasSavedDetails && !showSavedDetailsCard && (
                                            <button
                                                type="button"
                                                onClick={() => setShowSavedDetailsCard(true)}
                                                className="mb-4 text-sm text-emerald-600 dark:text-[#86efac] hover:underline flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="15 18 9 12 15 6" />
                                                </svg>
                                                Use saved details instead
                                            </button>
                                        )}
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                                            {deliveryMethod === 'delivery' ? 'Shipping Information' : 'Contact Information'}
                                        </h3>
                                        
                                        {/* Delivery Method Selection */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                                                Delivery Method
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                
                                                <label
                                                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        deliveryMethod === 'pickup'
                                                            ? 'border-[#86efac] bg-[#86efac]/10'
                                                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="deliveryMethod"
                                                        value="pickup"
                                                        checked={deliveryMethod === 'pickup'}
                                                        onChange={() => setDeliveryMethod('pickup')}
                                                        className="w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                            <polyline points="9 22 9 12 15 12 15 22" />
                                                        </svg>
                                                        <div>
                                                            <div className="font-medium text-neutral-900 dark:text-white">Pickup</div>
                                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">Collect from our location</div>
                                                        </div>
                                                    </div>
                                                </label>
                                                <label
                                                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        deliveryMethod === 'delivery'
                                                            ? 'border-[#86efac] bg-[#86efac]/10'
                                                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="deliveryMethod"
                                                        value="delivery"
                                                        checked={deliveryMethod === 'delivery'}
                                                        onChange={() => setDeliveryMethod('delivery')}
                                                        className="w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="1" y="3" width="15" height="13" />
                                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                                            <circle cx="5.5" cy="18.5" r="2.5" />
                                                            <circle cx="18.5" cy="18.5" r="2.5" />
                                                        </svg>
                                                        <div>
                                                            <div className="font-medium text-neutral-900 dark:text-white">Delivery</div>
                                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">Ship to your address</div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Shipping Speed Selection */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                                                Shipping Speed
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <label
                                                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        shippingSpeed === 'regular'
                                                            ? 'border-[#86efac] bg-[#86efac]/10'
                                                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="shippingSpeed"
                                                        value="regular"
                                                        checked={shippingSpeed === 'regular'}
                                                        onChange={() => setShippingSpeed('regular')}
                                                        className="w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-neutral-900 dark:text-white">Regular</div>
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">Free</div>
                                                    </div>
                                                </label>
                                                <label
                                                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        shippingSpeed === 'express'
                                                            ? 'border-[#86efac] bg-[#86efac]/10'
                                                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="shippingSpeed"
                                                        value="express"
                                                        checked={shippingSpeed === 'express'}
                                                        onChange={() => setShippingSpeed('express')}
                                                        className="w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-neutral-900 dark:text-white">Express</div>
                                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">$5 extra</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingInfo.first_name}
                                                    onChange={(e) => setShippingInfo({...shippingInfo, first_name: e.target.value})}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingInfo.last_name}
                                                    onChange={(e) => setShippingInfo({...shippingInfo, last_name: e.target.value})}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={shippingInfo.email}
                                                onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={shippingInfo.phone}
                                                onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                            />
                                        </div>

                                        {/* City field for pickup - required */}
                                        {deliveryMethod === 'pickup' && (
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                    City
                                                </label>
                                                <select
                                                    required
                                                    value={shippingInfo.city}
                                                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                >
                                                    <option value="" disabled>
                                                        Select a city
                                                    </option>
                                                    <option value="Harare">Harare</option>
                                                    <option value="Bulawayo">Bulawayo</option>
                                                    <option value="Chitungwiza">Chitungwiza</option>
                                                    <option value="Mutare">Mutare</option>
                                                    <option value="Gweru">Gweru</option>
                                                    <option value="Kwekwe">Kwekwe</option>
                                                    <option value="Kadoma">Kadoma</option>
                                                    <option value="Masvingo">Masvingo</option>
                                                    <option value="Victoria Falls">Victoria Falls</option>
                                                    <option value="Hwange">Hwange</option>
                                                    <option value="Marondera">Marondera</option>
                                                    <option value="Chinhoyi">Chinhoyi</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Address fields - only show for delivery */}
                                        {deliveryMethod === 'delivery' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                        Address Line 1
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={shippingInfo.address_1}
                                                        onChange={(e) => setShippingInfo({...shippingInfo, address_1: e.target.value})}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                        Address Line 2 (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={shippingInfo.address_2}
                                                        onChange={(e) => setShippingInfo({...shippingInfo, address_2: e.target.value})}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            City
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={shippingInfo.city}
                                                            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            State/Province (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={shippingInfo.state}
                                                            onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            Postal Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={shippingInfo.postcode}
                                                            onChange={(e) => setShippingInfo({...shippingInfo, postcode: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            Country Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={shippingInfo.country}
                                                            onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                            placeholder="ZW"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="flex justify-between pt-4">
                                            <Link
                                                href={`/product/${identifier}`}
                                                className="px-6 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                            >
                                                Back to Product
                                            </Link>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:hover:bg-emerald-400 dark:text-neutral-900 text-white font-medium rounded-lg transition-colors"
                                            >
                                                Continue to Billing
                                            </button>
                                        </div>
                                    </form>
                                        )}
                                    </>
                                )}

                                {/* Billing Form */}
                                {step === 'billing' && (
                                    <form onSubmit={handleBillingSubmit} className="space-y-4">
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Billing Information</h3>
                                        
                                        {deliveryMethod === 'delivery' && (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={sameAsShipping}
                                                    onChange={(e) => setSameAsShipping(e.target.checked)}
                                                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                                                />
                                                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                                    Same as shipping address
                                                </span>
                                            </label>
                                        )}

                                        {(deliveryMethod === 'pickup' || !sameAsShipping) && (
                                            <div className="space-y-4 mt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            First Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={billingInfo.first_name}
                                                            onChange={(e) => setBillingInfo({...billingInfo, first_name: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            Last Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={billingInfo.last_name}
                                                            onChange={(e) => setBillingInfo({...billingInfo, last_name: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={billingInfo.email}
                                                        onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                        Phone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={billingInfo.phone}
                                                        onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                        Address Line 1
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={billingInfo.address_1}
                                                        onChange={(e) => setBillingInfo({...billingInfo, address_1: e.target.value})}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                        Address Line 2 (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={billingInfo.address_2}
                                                        onChange={(e) => setBillingInfo({...billingInfo, address_2: e.target.value})}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            City
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={billingInfo.city}
                                                            onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            State/Province (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={billingInfo.state}
                                                            onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            Postal Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={billingInfo.postcode}
                                                            onChange={(e) => setBillingInfo({...billingInfo, postcode: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            Country Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={billingInfo.country}
                                                            onChange={(e) => setBillingInfo({...billingInfo, country: e.target.value})}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                                            placeholder="ZW"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep('shipping')}
                                                className="px-6 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:hover:bg-emerald-400 dark:text-neutral-900 text-white font-medium rounded-lg transition-colors"
                                            >
                                                Continue to Payment
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Payment Form */}
                                {step === 'payment' && (
                                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Payment & Agent</h3>
                                        
                                        {/* Express Checkout Summary */}
                                        {useExpressCheckout && hasSavedDetails && (
                                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 mb-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-emerald-600 dark:text-[#86efac]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                            <polyline points="22 4 12 14.01 9 11.01" />
                                                        </svg>
                                                        Using saved details
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUseExpressCheckout(false);
                                                            setShowSavedDetailsCard(false);
                                                            setStep('shipping');
                                                        }}
                                                        className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {shippingInfo.first_name} {shippingInfo.last_name} • {shippingInfo.email} • {shippingInfo.phone}
                                                </p>
                                                {shippingInfo.address_1 && (
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                                        {shippingInfo.address_1}, {shippingInfo.city}, {shippingInfo.country}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                Select Agent
                                            </label>
                                            <select
                                                required
                                                value={selectedAgent?.ID || ''}
                                                onChange={(e) => setSelectedAgent(agents.find(a => a.ID === e.target.value) || null)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                                            >
                                                {agents.map(agent => (
                                                    <option key={agent.ID} value={agent.ID}>
                                                        {agent.display_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                Payment Method
                                            </label>
                                            <div className="space-y-2">
                                                {paymentMethods.map(method => (
                                                    <label
                                                        key={method.id}
                                                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                            selectedPaymentMethod?.id === method.id
                                                                ? 'border-[#86efac] bg-[#86efac]/10'
                                                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="payment"
                                                            value={method.id}
                                                            checked={selectedPaymentMethod?.id === method.id}
                                                            onChange={() => setSelectedPaymentMethod(method)}
                                                            className="w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-neutral-900 dark:text-white">
                                                                {method.title}
                                                            </div>
                                                            {method.description && (
                                                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                                    {method.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {auth?.user && (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={saveProfile}
                                                    onChange={(e) => setSaveProfile(e.target.checked)}
                                                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                                                />
                                                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                                    Save this information for faster checkout next time
                                                </span>
                                            </label>
                                        )}

                                        <div className="flex justify-between pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (useExpressCheckout) {
                                                        setShowSavedDetailsCard(true);
                                                        setStep('shipping');
                                                    } else {
                                                        setStep('billing');
                                                    }
                                                }}
                                                className="px-6 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:hover:bg-emerald-400 dark:text-neutral-900 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Place Order
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sticky top-8">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Order Summary</h3>
                                
                                <div className="flex gap-4 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                                    <img
                                        src={product.images?.[0] || '/placeholder.png'}
                                        alt={product.title}
                                        className="w-20 h-20 object-contain rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
                                            {product.title}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                            Qty: 1
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
                                        <span className="text-neutral-900 dark:text-white font-medium">
                                            ${basePrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-600 dark:text-neutral-400">Shipping</span>
                                        <span className="text-neutral-900 dark:text-white font-medium">
                                            {shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : 'Free'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-neutral-900 dark:text-white">Total</span>
                                        <span className="text-lg font-bold text-emerald-600 dark:text-[#86efac]">
                                            ${totalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        USD (Delivered to Zimbabwe)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Toast Notifications */}
            <Toast 
                message={toastMessage} 
                type={toastType} 
                onDismiss={() => setToastMessage(null)} 
            />
        </>
    );
}
