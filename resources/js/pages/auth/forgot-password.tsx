import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ForgotPasswordProps {
    status?: string;
}

type ForgotPasswordForm = {
    email: string;
};

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm<Required<ForgotPasswordForm>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[radial-gradient(circle_at_center,_#6b21a8_-20%,_#000000_90%)] flex items-center justify-center p-6">
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    {/* Card Container */}
                    <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl p-8">
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <Link href={route('welcome')}>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-xl opacity-30 scale-110"></div>
                                    <div className="relative w-16 h-16">
                                        <AppLogoIcon className="w-full h-full object-contain drop-shadow-2xl" />
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
                            <p className="text-gray-400 text-sm">
                                No problem. Just let us know your email address and we'll email you a password reset link.
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p className="text-sm text-green-400 text-center">{status}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form className="space-y-6" onSubmit={submit}>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                                    disabled={processing}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                tabIndex={2}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Email Password Reset Link
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-gray-900/40 text-gray-400">or</span>
                            </div>
                        </div>

                        {/* Back to login link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                Remember your password?{' '}
                                <Link
                                    href={route('login')}
                                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                                    tabIndex={3}
                                >
                                    Back to login
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            If you don't receive an email, check your spam folder
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
