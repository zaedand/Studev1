import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|syne:700,800"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                @keyframes float-orb {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.05); }
                    66% { transform: translate(-20px, 15px) scale(0.97); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .anim-slide-up { animation: slide-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
                .anim-fade    { animation: fade-in 0.4s ease both; }
                .anim-delay-1 { animation-delay: 0.08s; }
                .anim-delay-2 { animation-delay: 0.16s; }
                .anim-delay-3 { animation-delay: 0.24s; }
                .anim-delay-4 { animation-delay: 0.32s; }
                .orb { animation: float-orb 12s ease-in-out infinite; }
                .orb-2 { animation: float-orb 16s ease-in-out infinite reverse; animation-delay: -4s; }
                .orb-3 { animation: float-orb 20s ease-in-out infinite; animation-delay: -8s; }

                .gradient-text {
                    background: linear-gradient(135deg, #e2e8f0 0%, #a78bfa 50%, #60a5fa 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }

                .glass-card {
                    background: rgba(15, 15, 25, 0.65);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow:
                        0 0 0 1px rgba(139,92,246,0.1),
                        0 32px 64px rgba(0,0,0,0.5),
                        inset 0 1px 0 rgba(255,255,255,0.06);
                }

                .input-field {
                    background: rgba(255,255,255,0.04) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    color: white !important;
                    transition: all 0.2s ease;
                    font-family: 'Instrument Sans', sans-serif;
                }
                .input-field::placeholder { color: rgba(255,255,255,0.25) !important; }
                .input-field:focus {
                    border-color: rgba(139,92,246,0.6) !important;
                    background: rgba(139,92,246,0.06) !important;
                    box-shadow: 0 0 0 3px rgba(139,92,246,0.12) !important;
                    outline: none !important;
                }
                .input-wrapper { position: relative; }
                .input-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255,255,255,0.3);
                    pointer-events: none;
                    width: 16px;
                    height: 16px;
                }
                .input-field-padded { padding-left: 2.5rem !important; }
                .toggle-pw {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255,255,255,0.35);
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 2px;
                    display: flex;
                    align-items: center;
                    border-radius: 4px;
                    transition: color 0.2s;
                }
                .toggle-pw:hover { color: rgba(139,92,246,0.9); }

                .btn-primary {
                    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%);
                    background-size: 200% 200%;
                    transition: all 0.3s ease;
                    font-family: 'Instrument Sans', sans-serif;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    border: none;
                }
                .btn-primary:hover:not(:disabled) {
                    background-position: right center;
                    box-shadow: 0 8px 24px rgba(109,40,217,0.4);
                    transform: translateY(-1px);
                }
                .btn-primary:active:not(:disabled) { transform: translateY(0); }
                .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

                .checkbox-custom {
                    border-color: rgba(255,255,255,0.2) !important;
                    background: rgba(255,255,255,0.04) !important;
                }
                .checkbox-custom[data-state=checked] {
                    background: #7c3aed !important;
                    border-color: #7c3aed !important;
                }

                .divider-line {
                    border-color: rgba(255,255,255,0.08);
                }
                .divider-text {
                    background: rgba(15,15,25,0.65);
                    color: rgba(255,255,255,0.3);
                    padding: 0 12px;
                    font-size: 11px;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
            `}</style>

            <div className="min-h-screen bg-[radial-gradient(circle_at_center,_#6b21a8_-20%,_#000000_90%)] flex items-center justify-center p-6 relative overflow-hidden">
                {/* Animated orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="orb absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.12]"
                        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
                    <div className="orb-2 absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.08]"
                        style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }} />
                    <div className="orb-3 absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-[0.05]"
                        style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                            backgroundSize: '60px 60px'
                        }} />
                </div>

                <div className="relative z-10 w-full max-w-[420px]">
                    {/* Card */}
                    <div className="glass-card rounded-2xl p-8 anim-slide-up">

                        {/* Logo + Badge */}
                        <div className="flex flex-col items-center mb-7 anim-slide-up anim-delay-1">
                            <Link href={route('welcome')}>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-xl opacity-30 scale-110"></div>
                                    <div className="relative w-16 h-16">
                                        <AppLogoIcon className="w-full h-full object-contain drop-shadow-2xl" />
                                    </div>
                                </div>
                            </Link>


                            <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Welcome back
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                                Enter password to continue
                            </p>
                        </div>

                        {/* Status */}
                        {status && (
                            <div className="mb-5 p-3 rounded-xl anim-fade"
                                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                <p className="text-sm text-green-400 text-center">{status}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5 anim-slide-up anim-delay-2">
                                <Label htmlFor="email" className="text-xs font-semibold tracking-wide"
                                    style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Email
                                </Label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="you@example.com"
                                        className="input-field input-field-padded h-11 rounded-xl text-sm"
                                        disabled={processing}
                                    />
                                </div>
                                <InputError message={errors.email} className="text-xs text-red-400" />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5 anim-slide-up anim-delay-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold tracking-wide"
                                        style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} tabIndex={5}
                                            className="text-xs transition-colors"
                                            style={{ color: 'rgba(167,139,250,0.8)' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(167,139,250,0.8)')}>
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="input-field input-field-padded h-11 rounded-xl text-sm pr-10"
                                        disabled={processing}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-pw"
                                        onClick={() => setShowPassword(v => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword
                                            ? <EyeOff className="w-4 h-4" />
                                            : <Eye className="w-4 h-4" />
                                        }
                                    </button>
                                </div>
                                <InputError message={errors.password} className="text-xs text-red-400" />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2.5 anim-slide-up anim-delay-3 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onClick={() => setData('remember', !data.remember)}
                                    tabIndex={3}
                                    className="checkbox-custom w-4 h-4 rounded"
                                />
                                <Label htmlFor="remember" className="text-sm cursor-pointer select-none"
                                    style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    Keep me signed in
                                </Label>
                            </div>

                            {/* Submit */}
                            <div className="anim-slide-up anim-delay-4 pt-1">
                                <button
                                    type="submit"
                                    tabIndex={4}
                                    disabled={processing}
                                    className="btn-primary w-full h-11 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                                >
                                    {processing
                                        ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Logging in...</>
                                        : 'Login'
                                    }
                                </button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t divider-line" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="divider-text">or</span>
                            </div>
                        </div>

                        {/* Sign up */}
                        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Don't have an account?{' '}
                            <Link href={route('register')} tabIndex={6}
                                className="font-semibold transition-colors"
                                style={{ color: '#a78bfa' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#a78bfa')}>
                                Create one →
                            </Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.18)' }}>
                        Protected by end-to-end encryption
                    </p>
                </div>
            </div>
        </>
    );
}
