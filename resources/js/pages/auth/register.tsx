import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState, useMemo } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

// Password strength checker
function getPasswordStrength(password: string): {
    score: number; // 0-4
    label: string;
    color: string;
    bars: string[];
} {
    if (!password) return { score: 0, label: '', color: '', bars: ['', '', '', ''] };

    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Normalize to 0-4
    const s = Math.min(4, score);

    const config = [
        { label: '', color: 'transparent' },
        { label: 'Weak', color: '#ef4444' },
        { label: 'Fair', color: '#f97316' },
        { label: 'Good', color: '#eab308' },
        { label: 'Strong', color: '#22c55e' },
    ];

    const bars = Array(4).fill('').map((_, i) =>
        i < s ? config[s].color : 'rgba(255,255,255,0.08)'
    );

    return { score: s, label: config[s].label, color: config[s].color, bars };
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const strength = useMemo(() => getPasswordStrength(data.password), [data.password]);

    const passwordsMatch = data.password_confirmation
        ? data.password === data.password_confirmation
        : null;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register">
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
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes bar-fill {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }
                .anim-slide-up { animation: slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both; }
                .anim-d1 { animation-delay: 0.06s; }
                .anim-d2 { animation-delay: 0.12s; }
                .anim-d3 { animation-delay: 0.18s; }
                .anim-d4 { animation-delay: 0.24s; }
                .anim-d5 { animation-delay: 0.30s; }
                .orb  { animation: float-orb 14s ease-in-out infinite; }
                .orb2 { animation: float-orb 18s ease-in-out infinite reverse; animation-delay: -5s; }
                .orb3 { animation: float-orb 22s ease-in-out infinite; animation-delay: -10s; }

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
                .input-field.match-ok:not(:placeholder-shown) {
                    border-color: rgba(34,197,94,0.5) !important;
                    background: rgba(34,197,94,0.04) !important;
                }
                .input-field.match-fail {
                    border-color: rgba(239,68,68,0.5) !important;
                    background: rgba(239,68,68,0.04) !important;
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
                .input-padded { padding-left: 2.5rem !important; }
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

                .strength-bar {
                    height: 3px;
                    border-radius: 9999px;
                    flex: 1;
                    transition: background-color 0.35s ease;
                }

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
                    <div className="orb absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.10]"
                        style={{ background: 'radial-gradient(circle, #4f46e5, transparent 70%)' }} />
                    <div className="orb2 absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full opacity-[0.09]"
                        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
                    <div className="orb3 absolute top-[35%] right-[30%] w-[280px] h-[280px] rounded-full opacity-[0.05]"
                        style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }} />
                    <div className="absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                            backgroundSize: '60px 60px'
                        }} />
                </div>

                <div className="relative z-10 w-full max-w-[420px]">
                    <div className="glass-card rounded-2xl p-8 anim-slide-up">

                        {/* Logo + Header */}
                        <div className="flex flex-col items-center mb-6 anim-slide-up anim-d1">
                            <Link href={route('welcome')}>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-xl opacity-30 scale-110"></div>
                                    <div className="relative w-16 h-16">
                                        <AppLogoIcon className="w-full h-full object-contain drop-shadow-2xl" />
                                    </div>
                                </div>
                            </Link>

                            <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Create account
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                                Fill in your details to get started
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5 anim-slide-up anim-d2">
                                <Label htmlFor="name" className="text-xs font-semibold"
                                    style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Full Name
                                </Label>
                                <div className="input-wrapper">
                                    <User className="input-icon" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="John Doe"
                                        className="input-field input-padded h-11 rounded-xl text-sm"
                                    />
                                </div>
                                <InputError message={errors.name} className="text-xs text-red-400" />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5 anim-slide-up anim-d2">
                                <Label htmlFor="email" className="text-xs font-semibold"
                                    style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Email
                                </Label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="you@example.com"
                                        className="input-field input-padded h-11 rounded-xl text-sm"
                                    />
                                </div>
                                <InputError message={errors.email} className="text-xs text-red-400" />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5 anim-slide-up anim-d3">
                                <Label htmlFor="password" className="text-xs font-semibold"
                                    style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Password
                                </Label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Min. 8 characters"
                                        className="input-field input-padded h-11 rounded-xl text-sm pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-pw"
                                        onClick={() => setShowPassword(v => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Strength indicator */}
                                {data.password && (
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex gap-1.5">
                                            {strength.bars.map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="strength-bar"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs" style={{ color: strength.color, fontWeight: 500 }}>
                                                {strength.label}
                                            </span>
                                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                                {strength.score < 2 && 'Add uppercase & symbols'}
                                                {strength.score === 2 && 'Add numbers & symbols'}
                                                {strength.score === 3 && 'Add special characters'}
                                                {strength.score >= 4 && 'Great password!'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <InputError message={errors.password} className="text-xs text-red-400" />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5 anim-slide-up anim-d4">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold"
                                    style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Confirm Password
                                </Label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" />
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Repeat your password"
                                        className={`input-field input-padded h-11 rounded-xl text-sm pr-10 ${
                                            passwordsMatch === true ? 'match-ok' :
                                            passwordsMatch === false ? 'match-fail' : ''
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-pw"
                                        onClick={() => setShowConfirm(v => !v)}
                                        tabIndex={-1}
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Match feedback */}
                                {data.password_confirmation && (
                                    <p className="text-xs mt-1" style={{
                                        color: passwordsMatch ? '#22c55e' : '#ef4444'
                                    }}>
                                        {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}

                                <InputError message={errors.password_confirmation} className="text-xs text-red-400" />
                            </div>

                            {/* Submit */}
                            <div className="anim-slide-up anim-d5 pt-1">
                                <button
                                    type="submit"
                                    tabIndex={5}
                                    disabled={processing}
                                    className="btn-primary w-full h-11 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                                >
                                    {processing
                                        ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Creating account...</>
                                        : 'Create account'
                                    }
                                </button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="relative my-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="divider-text">or</span>
                            </div>
                        </div>

                        {/* Login link */}
                        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Already have an account?{' '}
                            <Link href={route('login')} tabIndex={6}
                                className="font-semibold transition-colors"
                                style={{ color: '#a78bfa' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#a78bfa')}>
                                Login →
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.18)' }}>
                        By registering, you agree to our Terms of Service
                    </p>
                </div>
            </div>
        </>
    );
}
