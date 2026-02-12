import { useState, FormEvent, ChangeEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

interface ProfilePageProps {
    auth: {
        user: User;
    };
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Profile({ auth, mustVerifyEmail, status }: ProfilePageProps) {
    const user = auth.user;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Profile form
    const { data: profileData, setData: setProfileData, patch, processing: profileProcessing, errors: profileErrors, recentlySuccessful: profileSuccess } = useForm({
        name: user.name,
        email: user.email,
    });

    // Password form
    const { data: passwordData, setData: setPasswordData, put, processing: passwordProcessing, errors: passwordErrors, recentlySuccessful: passwordSuccess, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Delete form
    const { data: deleteData, setData: setDeleteData, delete: destroy, processing: deleteProcessing, errors: deleteErrors, reset: resetDelete } = useForm({
        password: '',
    });

    const handleProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        patch('/profile', {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        put('/password', {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    const handleDeleteSubmit = (e: FormEvent) => {
        e.preventDefault();
        destroy('/profile', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Profile Settings" />

            <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
                {/* Sidebar */}
                <aside className="hidden lg:flex w-[260px] flex-col p-4 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                        <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]" title={user.email}>
                            {user.email}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-xs text-neutral-500 hover:text-[#86efac] dark:text-neutral-400 dark:hover:text-pink-400 transition-colors"
                        >
                            Log out
                        </Link>
                    </div>
                    <nav className="flex-1 space-y-1">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="9" />
                                <rect x="14" y="3" width="7" height="5" />
                                <rect x="14" y="12" width="7" height="9" />
                                <rect x="3" y="16" width="7" height="5" />
                            </svg>
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Profile Settings
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white">
                            <img src="/images/logo.png" alt="Storeflex" className="h-8 w-auto" />
                     
                        </Link>

                        <nav className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                Log out
                            </Link>
                        </nav>
                    </header>

                    {/* Profile Content */}
                    <main className="flex-1 p-4 sm:p-6">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                Profile Settings
                            </h1>

                            {/* Profile Information */}
                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                    Profile Information
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                    Update your account's profile information and email address.
                                </p>

                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setProfileData('name', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all"
                                            required
                                        />
                                        {profileErrors.name && (
                                            <p className="mt-1 text-sm text-red-500">{profileErrors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setProfileData('email', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all"
                                            required
                                        />
                                        {profileErrors.email && (
                                            <p className="mt-1 text-sm text-red-500">{profileErrors.email}</p>
                                        )}
                                    </div>

                                    {mustVerifyEmail && !user.email_verified_at && (
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href="/email/verification-notification"
                                                    method="post"
                                                    as="button"
                                                    className="underline hover:text-yellow-800 dark:hover:text-yellow-300"
                                                >
                                                    Click here to re-send the verification email.
                                                </Link>
                                            </p>
                                            {status === 'verification-link-sent' && (
                                                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                                    A new verification link has been sent to your email address.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={profileProcessing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {profileProcessing ? 'Saving...' : 'Save'}
                                        </button>
                                        {profileSuccess && (
                                            <span className="text-sm text-green-600 dark:text-green-400">Saved.</span>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Update Password */}
                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                    Update Password
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>

                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="current_password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            id="current_password"
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordData('current_password', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all"
                                            autoComplete="current-password"
                                        />
                                        {passwordErrors.current_password && (
                                            <p className="mt-1 text-sm text-red-500">{passwordErrors.current_password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={passwordData.password}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordData('password', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all"
                                            autoComplete="new-password"
                                        />
                                        {passwordErrors.password && (
                                            <p className="mt-1 text-sm text-red-500">{passwordErrors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Confirm Password
                                        </label>
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            value={passwordData.password_confirmation}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordData('password_confirmation', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all"
                                            autoComplete="new-password"
                                        />
                                        {passwordErrors.password_confirmation && (
                                            <p className="mt-1 text-sm text-red-500">{passwordErrors.password_confirmation}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={passwordProcessing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {passwordProcessing ? 'Saving...' : 'Save'}
                                        </button>
                                        {passwordSuccess && (
                                            <span className="text-sm text-green-600 dark:text-green-400">Saved.</span>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Delete Account */}
                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-red-200 dark:border-red-900/50 p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                    Delete Account
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                    Once your account is deleted, all of its resources and data will be permanently deleted.
                                </p>

                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                    >
                                        Delete Account
                                    </button>
                                ) : (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-4">
                                        <p className="text-sm text-red-700 dark:text-red-400">
                                            Are you sure you want to delete your account? Please enter your password to confirm.
                                        </p>
                                        <form onSubmit={handleDeleteSubmit} className="space-y-4">
                                            <div>
                                                <input
                                                    type="password"
                                                    value={deleteData.password}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDeleteData('password', e.target.value)}
                                                    placeholder="Password"
                                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all"
                                                />
                                                {deleteErrors.password && (
                                                    <p className="mt-1 text-sm text-red-500">{deleteErrors.password}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowDeleteConfirm(false);
                                                        resetDelete();
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={deleteProcessing}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {deleteProcessing ? 'Deleting...' : 'Delete Account'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="px-6 py-4 text-center text-[13px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800">
                        <p>
                            Storeflex by{' '}
                            <a href="https://dxbrunners.com" target="_blank" rel="noopener noreferrer" className="text-[#a855f7] hover:underline">
                                DXB Runners
                            </a>{' '}
                            &middot; Your trusted dropshipping partner for Amazon.ae products
                            &middot;{' '}
                            <Link href="/terms" className="text-[#a855f7] hover:underline">
                                Terms & Conditions
                            </Link>
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
