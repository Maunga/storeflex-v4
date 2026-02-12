import { useState, useEffect } from 'react';

interface ToastProps {
    message: string | null;
    type?: 'error' | 'success' | 'info';
    duration?: number;
    onDismiss?: () => void;
}

export default function Toast({ message, type = 'error', duration = 5000, onDismiss }: ToastProps) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            setExiting(false);

            const timer = setTimeout(() => {
                dismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [message]);

    const dismiss = () => {
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            setExiting(false);
            onDismiss?.();
        }, 300);
    };

    if (!visible || !message) return null;

    const bgColor = {
        error: 'bg-red-600 dark:bg-red-500',
        success: 'bg-emerald-600 dark:bg-emerald-500',
        info: 'bg-blue-600 dark:bg-blue-500',
    }[type];

    const icon = {
        error: (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
        success: (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
    }[type];

    return (
        <div className="fixed top-6 right-6 z-[9999]">
            <div
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium max-w-md ${bgColor} ${
                    exiting ? 'animate-toast-exit' : 'animate-toast-enter'
                }`}
            >
                {icon}
                <span className="leading-snug">{message}</span>
                <button
                    onClick={dismiss}
                    className="ml-2 p-0.5 rounded-md hover:bg-white/20 transition-colors flex-shrink-0"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
