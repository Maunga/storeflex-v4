import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
                        <img src="/images/logo.png" alt="Storeflex" className="h-10 w-auto" />
                        <span className="font-bold text-2xl text-neutral-900 dark:text-white">Storeflex</span>
                    </Link>

                    {/* Card */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                            Welcome back
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                            Sign in to continue to Storeflex
                        </p>

                        {status && (
                            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm text-green-600 dark:text-green-400">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#86efac]/20 focus:border-[#86efac] transition-colors"
                                        placeholder="you@gmail.com"
                                        autoComplete="username"
                                    />
                                    {errors.email && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#86efac]/20 focus:border-[#86efac] transition-colors"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    {errors.password && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-[#86efac] focus:ring-[#86efac]/20"
                                        />
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Remember me</span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-[#a855f7] hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-6 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-[#a855f7] hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
