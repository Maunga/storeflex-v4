import { useState, useEffect, FormEvent } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { ProductData } from '@/types';

interface BuyModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductData;
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

export default function BuyModal({ isOpen, onClose, product }: BuyModalProps) {
    const { fetchAgents, fetchPaymentMethods, place } = useOrders();
    
    const [step, setStep] = useState<'shipping' | 'billing' | 'payment'>('shipping');
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: 'Zimbabwe',
        email: '',
        phone: '',
    });
    
    const [billingInfo, setBillingInfo] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: 'Zimbabwe',
        email: '',
        phone: '',
    });
    
    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadAgentsAndPaymentMethods();
        }
    }, [isOpen]);

    useEffect(() => {
        if (sameAsShipping) {
            setBillingInfo(shippingInfo);
        }
    }, [sameAsShipping, shippingInfo]);

    async function loadAgentsAndPaymentMethods() {
        try {
            const [agentsData, paymentMethodsData] = await Promise.all([
                fetchAgents(),
                fetchPaymentMethods()
            ]);
            setAgents(agentsData || []);
            setPaymentMethods(paymentMethodsData || []);
            
            if (agentsData?.length > 0) setSelectedAgent(agentsData[0]);
            if (paymentMethodsData?.length > 0) setSelectedPaymentMethod(paymentMethodsData[0]);
        } catch (error) {
            console.error('Error loading data:', error);
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
            alert('Please select an agent and payment method');
            return;
        }

        setLoading(true);
        try {
            const attemptId = crypto.randomUUID();
            
            const extras = {
                payment_method: {
                    id: selectedPaymentMethod.id,
                    title: selectedPaymentMethod.title,
                },
                agent: {
                    ID: selectedAgent.ID,
                    display_name: selectedAgent.display_name,
                },
            };

            const result = await place(
                shippingInfo,
                sameAsShipping ? shippingInfo : billingInfo,
                extras,
                attemptId
            );

            alert('Order placed successfully!');
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                        Complete Your Purchase
                    </h2>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {['shipping', 'billing', 'payment'].map((s, i) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                                    step === s
                                        ? 'bg-[#86efac] text-neutral-900'
                                        : i < ['shipping', 'billing', 'payment'].indexOf(step)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                                }`}>
                                    {i + 1}
                                </div>
                                {i < 2 && <div className="flex-1 h-0.5 mx-2 bg-neutral-200 dark:bg-neutral-700" />}
                            </div>
                        ))}
                    </div>

                    {/* Shipping Form */}
                    {step === 'shipping' && (
                        <form onSubmit={handleShippingSubmit} className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Shipping Information</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    required
                                    value={shippingInfo.firstName}
                                    onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    required
                                    value={shippingInfo.lastName}
                                    onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Address"
                                required
                                value={shippingInfo.address}
                                onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="City"
                                    required
                                    value={shippingInfo.city}
                                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    required
                                    value={shippingInfo.country}
                                    onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    required
                                    value={shippingInfo.email}
                                    onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    required
                                    value={shippingInfo.phone}
                                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Continue to Billing
                            </button>
                        </form>
                    )}

                    {/* Billing Form */}
                    {step === 'billing' && (
                        <form onSubmit={handleBillingSubmit} className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Billing Information</h3>
                            
                            <label className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                <input
                                    type="checkbox"
                                    checked={sameAsShipping}
                                    onChange={(e) => setSameAsShipping(e.target.checked)}
                                    className="w-4 h-4 rounded border-neutral-300"
                                />
                                Same as shipping address
                            </label>

                            {!sameAsShipping && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            required
                                            value={billingInfo.firstName}
                                            onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
                                            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            required
                                            value={billingInfo.lastName}
                                            onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
                                            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Address"
                                        required
                                        value={billingInfo.address}
                                        onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            required
                                            value={billingInfo.city}
                                            onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                                            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Country"
                                            required
                                            value={billingInfo.country}
                                            onChange={(e) => setBillingInfo({...billingInfo, country: e.target.value})}
                                            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            required
                                            value={billingInfo.email}
                                            onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                                            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            required
                                            value={billingInfo.phone}
                                            onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                                            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('shipping')}
                                    className="flex-1 px-5 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Payment Form */}
                    {step === 'payment' && (
                        <form onSubmit={handlePlaceOrder} className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Payment & Agent</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Select Agent
                                </label>
                                <select
                                    value={selectedAgent?.ID || ''}
                                    onChange={(e) => setSelectedAgent(agents.find(a => a.ID === e.target.value) || null)}
                                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                    required
                                >
                                    {agents.map((agent) => (
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
                                <select
                                    value={selectedPaymentMethod?.id || ''}
                                    onChange={(e) => setSelectedPaymentMethod(paymentMethods.find(pm => pm.id === e.target.value) || null)}
                                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                    required
                                >
                                    {paymentMethods.map((method) => (
                                        <option key={method.id} value={method.id}>
                                            {method.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                                <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Order Summary</h4>
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={product.images?.[0] || ''}
                                        alt={product.title}
                                        className="w-16 h-16 object-contain rounded bg-white"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-900 dark:text-white font-medium line-clamp-2">
                                            {product.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                                    <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
                                        <span>Total:</span>
                                        <span className="text-emerald-600 dark:text-[#86efac]">
                                            ${product.dxb_price || product.price}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('billing')}
                                    disabled={loading}
                                    className="flex-1 px-5 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                                        'Place Order'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
