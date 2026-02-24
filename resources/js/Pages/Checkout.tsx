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
    
    // Payment processing state
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentPollUrl, setPaymentPollUrl] = useState<string | null>(null);
    const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
    const [pendingOrderReference, setPendingOrderReference] = useState<string | null>(null);
    
    // Payment percentage modal state
    const [showPaymentPercentageModal, setShowPaymentPercentageModal] = useState(false);
    const [selectedPaymentPercentage, setSelectedPaymentPercentage] = useState<75 | 100>(100);
    
    // EcoCash phone number state
    const [ecocashPhone, setEcocashPhone] = useState('');
    
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

    // Update ecocash phone when shipping phone changes (if ecocash phone is empty)
    useEffect(() => {
        // Only auto-populate if we have a valid phone number (not just "0" or similar)
        if (!ecocashPhone && shippingInfo.phone && shippingInfo.phone.length > 3) {
            setEcocashPhone('');
        }
    }, [shippingInfo.phone]);

    async function loadAgentsAndPaymentMethods() {
        try {
            const [agentsResponse, paymentMethodsResponse] = await Promise.all([
                axios.get('/api/checkout/agents'),
                axios.get('/api/payments/methods')
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

        // For EcoCash, phone is required
        if (selectedPaymentMethod.requires_phone && !ecocashPhone) {
            setToastType('error');
            setToastMessage('Please enter your EcoCash phone number');
            return;
        }

        // For cash payments, proceed directly without payment percentage modal
        if (selectedPaymentMethod.type === 'cash') {
            await processOrderWithPayment(100);
            return;
        }

        // For non-cash payments, show the payment percentage modal
        setShowPaymentPercentageModal(true);
    };

    const processOrderWithPayment = async (paymentPercentage: 75 | 100) => {
        setShowPaymentPercentageModal(false);
        setLoading(true);
        setPaymentProcessing(false);
        setPaymentMessage(null);
        
        const paymentAmount = paymentPercentage === 100 ? totalPrice : totalPrice * 0.75;
        
        try {
            // Prepare checkout data
            const checkoutData = {
                asin: identifier,
                quantity: 1,
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
                        fee: shippingFee,
                    },
                    payment_percentage: paymentPercentage,
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

            // For CASH payments: Create order directly (order-first flow)
            if (selectedPaymentMethod!.type === 'cash') {
                const response = await axios.post('/api/checkout/process', checkoutData);

                if (!response.data.success) {
                    throw new Error(response.data.message || 'Order failed');
                }

                const orderData = response.data.data?.order ?? null;
                
                setOrderSuccess({
                    orderId: orderData?.id ?? null,
                    wooOrderId: response.data.data?.woocommerce_order_id ?? null,
                    total: orderData?.total ?? null,
                    paymentMethod: selectedPaymentMethod!.title,
                    deliveryMethod,
                    shipping: shippingInfo,
                    billing: sameAsShipping ? shippingInfo : billingInfo,
                    quantity: checkoutData.quantity,
                    productTitle: product.title ?? 'Order Item',
                    productImage: product.images?.[0] ?? '/placeholder.png',
                });
                setLoading(false);
                return;
            }

            // For NON-CASH payments: Initiate payment FIRST (payment-first flow)
            // Generate a temporary reference for the payment
            const tempReference = `SF-${Date.now()}`;
            setPendingOrderReference(tempReference);

            // Initiate payment with checkout data attached
            const paymentResponse = await axios.post('/api/payments/initiate', {
                provider: selectedPaymentMethod!.id,
                amount: paymentAmount,
                reference: tempReference,
                email: shippingInfo.email,
                phone: selectedPaymentMethod!.requires_phone ? ecocashPhone : shippingInfo.phone,
                description: `Order for ${product.title}${paymentPercentage === 75 ? ' (75% deposit)' : ''}`,
                product_name: product.title,
                product_image: product.images?.[0],
                currency: 'USD',
                payment_percentage: paymentPercentage,
                checkout_data: checkoutData, // Include checkout data for payment-first flow
            });

            if (!paymentResponse.data.success) {
                throw new Error(paymentResponse.data.message || 'Payment initialization failed');
            }

            // Handle different payment flows
            if (paymentResponse.data.requires_redirect && paymentResponse.data.redirect_url) {
                // Redirect to external payment page (Paynow web, PayPal, Stripe)
                // Order will be created after payment is confirmed via webhook
                setToastType('info');
                setToastMessage('Redirecting to payment page...');
                window.location.href = paymentResponse.data.redirect_url;
                return;
            }

            if (paymentResponse.data.poll_url) {
                // Mobile payment (EcoCash) - start polling
                // Order will be created when payment is confirmed
                setPaymentProcessing(true);
                setPaymentPollUrl(paymentResponse.data.poll_url);
                setPaymentMessage(paymentResponse.data.message || 'Please complete payment on your phone...');
                setLoading(false);
                
                // Start polling for payment status - order will be created on success
                pollPaymentStatus(paymentResponse.data.poll_url, null, selectedPaymentMethod!.title, tempReference);
                return;
            }

            // Fallback: should not reach here
            throw new Error('Unexpected payment response');

        } catch (error: any) {
            setToastType('error');
            setToastMessage(error.response?.data?.message || error.message || 'Failed to place order. Please try again.');
        } finally {
            if (!paymentProcessing) {
                setLoading(false);
            }
        }
    };

    // Poll for mobile payment status (EcoCash)
    const pollPaymentStatus = async (pollUrl: string, orderData: any, paymentMethodTitle: string, reference?: string) => {
        const maxAttempts = 60; // 5 minutes with 5-second intervals
        let attempts = 0;

        const poll = async () => {
            if (attempts >= maxAttempts) {
                setPaymentProcessing(false);
                setPaymentMessage(null);
                setToastType('error');
                setToastMessage('Payment timeout. Please try again or contact support.');
                return;
            }

            try {
                const response = await axios.post('/api/payments/status', {
                    provider: selectedPaymentMethod?.id,
                    poll_url: pollUrl,
                    reference: reference, // Pass reference for order lookup
                });

                if (response.data.paid) {
                    // Payment successful!
                    setPaymentProcessing(false);
                    setPaymentMessage(null);
                    setToastType('success');
                    setToastMessage('Payment received!');
                    
                    // Use order data from response if available (payment-first flow)
                    const finalOrderData = response.data.order ?? orderData;
                    
                    setOrderSuccess({
                        orderId: finalOrderData?.id ?? null,
                        wooOrderId: finalOrderData?.woocommerce_order_id ?? null,
                        total: finalOrderData?.total ?? null,
                        paymentMethod: paymentMethodTitle,
                        deliveryMethod,
                        shipping: shippingInfo,
                        billing: sameAsShipping ? shippingInfo : billingInfo,
                        quantity: 1,
                        productTitle: product.title ?? 'Order Item',
                        productImage: product.images?.[0] ?? '/placeholder.png',
                    });
                    return;
                }

                // Still pending - continue polling
                attempts++;
                setTimeout(poll, 5000);
            } catch (error) {
                console.error('Error polling payment status:', error);
                attempts++;
                setTimeout(poll, 5000);
            }
        };

        poll();
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
                                                {orderSuccess.total != null ? `USD $${orderSuccess.total}` : 'Paid'}
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
                                                {orderSuccess.total != null ? `USD $${orderSuccess.total}` : 'Paid'}
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
                                                        <div className="flex items-center gap-3 flex-1">
                                                            {/* Payment method icon */}
                                                            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                                {method.icon === 'ecocash' && (
                                                                    <span className="text-lg font-bold text-green-600">EC</span>
                                                                )}
                                                                {method.icon === 'paynow' && (
                                                                    <span className="text-lg font-bold text-blue-600">PN</span>
                                                                )}
                                                                {method.icon === 'paypal' && (
                                                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                                                        <path d="M19.5 8.5c0 4-3.5 7-8 7h-1l-1 4H6l-.5 1H2l3-14h6c3.5 0 8.5 0 8.5 3z" stroke="#003087" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                        <path d="M17 6c0 4-3 6.5-7.5 6.5" stroke="#009cde" strokeWidth="1.5" strokeLinecap="round"/>
                                                                    </svg>
                                                                )}
                                                                {method.icon === 'stripe' && (
                                                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                                                        <rect x="2" y="5" width="20" height="14" rx="3" stroke="#635bff" strokeWidth="1.5"/>
                                                                        <path d="M8 12.5c0-2 1.5-3 3-3 1 0 1.8.5 1.8 1.3 0 2-4.8 1.2-4.8 3.7 0 1 .8 1.5 2 1.5 1 0 2-.5 2.5-1" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round"/>
                                                                    </svg>
                                                                )}
                                                                {method.icon === 'cash' && (
                                                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                    </svg>
                                                                )}
                                                                {!method.icon && (
                                                                    <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                                                                    {method.title}
                                                                    {method.type === 'mobile_push' && (
                                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                                            Mobile
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {method.description && (
                                                                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                                        {method.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* EcoCash Phone Number Input */}
                                        {selectedPaymentMethod?.requires_phone && (
                                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                                <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                                    EcoCash Phone Number
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="tel"
                                                        value={ecocashPhone}
                                                        onChange={(e) => setEcocashPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                                        placeholder="077 123 4567"
                                                        className="flex-1 px-4 py-2.5 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                        maxLength={10}
                                                    />
                                                </div>
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                                    A USSD prompt will be sent to this number to complete payment
                                                </p>
                                            </div>
                                        )}

                                        {/* Payment processing overlay for mobile payments */}
                                        {paymentProcessing && (
                                            <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Waiting for payment...</h4>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                            {paymentMessage || 'Please complete payment on your phone'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPaymentProcessing(false);
                                                        setPaymentMessage(null);
                                                        setPaymentPollUrl(null);
                                                    }}
                                                    className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    Cancel and try another method
                                                </button>
                                            </div>
                                        )}

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
                                                disabled={paymentProcessing}
                                                className="px-6 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || paymentProcessing}
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
                                                ) : selectedPaymentMethod?.type === 'cash' ? (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Place Order
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        Proceed to Payment
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
                                            USD ${totalPrice.toFixed(2)}
                                        </span>
                                    </div>
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

            {/* Payment Percentage Modal */}
            {showPaymentPercentageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                Choose Payment Amount
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                Select how much you'd like to pay now
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {/* 100% Option */}
                            <button
                                type="button"
                                onClick={() => setSelectedPaymentPercentage(100)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    selectedPaymentPercentage === 100
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-neutral-900 dark:text-white">
                                            Pay in Full (100%)
                                        </div>
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                                            Complete payment now - no balance remaining
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-emerald-600 dark:text-[#86efac]">
                                            ${totalPrice.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* 75% Option */}
                            <button
                                type="button"
                                onClick={() => setSelectedPaymentPercentage(75)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    selectedPaymentPercentage === 75
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-neutral-900 dark:text-white">
                                            Pay Deposit (75%)
                                        </div>
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                                            Pay ${(totalPrice * 0.25).toFixed(2)} remaining on delivery
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-emerald-600 dark:text-[#86efac]">
                                            ${(totalPrice * 0.75).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-500">
                                            + ${(totalPrice * 0.25).toFixed(2)} later
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowPaymentPercentageModal(false)}
                                className="flex-1 px-4 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => processOrderWithPayment(selectedPaymentPercentage)}
                                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:hover:bg-emerald-400 dark:text-neutral-900 rounded-lg transition-colors"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
