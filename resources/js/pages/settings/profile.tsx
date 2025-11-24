import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { User, Mail, CheckCircle, AlertCircle, Hash, Calendar, Shield, Send } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Profile',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    nim?: string;
};

export default function Profile({
    mustVerifyEmail,
    status
}: {
    mustVerifyEmail: boolean;
    status?: string
}) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as any;
    const isStudent = user.role === 'student';
    const [verificationSending, setVerificationSending] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        name: user.name,
        email: user.email,
        nim: user.nim || '',
    });

    const { post: sendVerification } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const handleSendVerification = () => {
        setVerificationSending(true);
        sendVerification(route('verification.send'), {
            preserveScroll: true,
            onFinish: () => setVerificationSending(false),
        });
    };

    // Fungsi untuk mendapatkan label role
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'student': return 'Mahasiswa';
            case 'instructor': return 'Dosen';
            case 'admin': return 'Administrator';
            default: return role;
        }
    };

    // Format tanggal
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Informasi Profil
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Perbarui informasi profil dan alamat email akun Anda
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <label
                                htmlFor="name"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                <User className="h-4 w-4" />
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Masukkan nama lengkap"
                                required
                                autoComplete="name"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* NIM Input - Only for Student */}
                        {isStudent && (
                            <div>
                                <label
                                    htmlFor="nim"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    <Hash className="h-4 w-4" />
                                    NIM (Nomor Induk Mahasiswa)
                                </label>
                                <input
                                    id="nim"
                                    type="text"
                                    value={data.nim}
                                    onChange={(e) => setData('nim', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Masukkan NIM Anda"
                                    autoComplete="off"
                                />
                                {errors.nim && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.nim}
                                    </p>
                                )}
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    NIM akan ditampilkan di profil dan sertifikat Anda
                                </p>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label
                                htmlFor="email"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                <Mail className="h-4 w-4" />
                                Alamat Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Masukkan alamat email"
                                required
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Email Verification Notice */}
                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                                            Alamat email Anda belum terverifikasi
                                        </p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                            Silakan verifikasi email Anda dengan mengklik link yang telah dikirimkan ke email Anda.
                                        </p>

                                        {/* Button Send Verification */}
                                        <button
                                            type="button"
                                            onClick={handleSendVerification}
                                            disabled={verificationSending}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            {verificationSending ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Kirim Ulang Email Verifikasi
                                                </>
                                            )}
                                        </button>

                                        {status === 'verification-link-sent' && (
                                            <p className="mt-3 text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                                                <CheckCircle className="h-4 w-4" />
                                                Link verifikasi baru telah dikirim ke alamat email Anda.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {recentlySuccessful && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Informasi profil berhasil diperbarui!
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>

                    {/* Account Info Card */}
                    <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Informasi Akun
                        </h3>
                        <dl className="space-y-4">
                            {/* Role */}
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Status
                                </dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.role === 'student'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : user.role === 'instructor'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </dd>
                            </div>

                            {/* Created At */}
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Dibuat pada
                                </dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatDate(user.created_at)}
                                </dd>
                            </div>

                            {/* Email Verified */}
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Status Email
                                </dt>
                                <dd className="text-sm font-medium flex items-center gap-2">
                                    {user.email_verified_at ? (
                                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4" />
                                            Terverifikasi
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                Belum Terverifikasi
                                            </span>
                                            {mustVerifyEmail && (
                                                <button
                                                    type="button"
                                                    onClick={handleSendVerification}
                                                    disabled={verificationSending}
                                                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors"
                                                >
                                                    {verificationSending ? 'Mengirim...' : 'Verifikasi'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </dd>
                            </div>

                            {/* NIM - Only for Student */}
                            {isStudent && user.nim && (
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Hash className="h-4 w-4" />
                                        NIM
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                                        {user.nim}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
