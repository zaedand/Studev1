import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import {
    User, Mail, CheckCircle, AlertCircle, Hash,
    Calendar, Shield, Send, Flame, Trophy, Star,
    BookOpen, Clock, ClipboardList, Upload, Award
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan', href: '/settings' },
    { title: 'Profil', href: '/settings/profile' },
];

type ProfileForm = {
    name: string;
    email: string;
    nim?: string;
};

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    earned: boolean;
}

interface TitleInfo {
    label: string;
    color: string;
    icon: string;
}

interface Stats {
    total_modules: number;
    completed_modules: number;
    total_quizzes: number;
    first_attempt_wins: number;
    total_submissions: number;
    late_submissions: number;
    on_time_count: number;
    is_top_student: boolean;
    rank: number;
    points: number;
}

// ── Warna lencana ──────────────────────────────────────────
const BADGE_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    gold:   { bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-300 dark:border-amber-600',  text: 'text-amber-700 dark:text-amber-300',   glow: 'shadow-amber-200 dark:shadow-amber-900' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-600',text: 'text-yellow-700 dark:text-yellow-300', glow: 'shadow-yellow-200 dark:shadow-yellow-900' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/20',border: 'border-emerald-300 dark:border-emerald-600',text: 'text-emerald-700 dark:text-emerald-300',glow: 'shadow-emerald-200 dark:shadow-emerald-900' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-300 dark:border-purple-600',text: 'text-purple-700 dark:text-purple-300', glow: 'shadow-purple-200 dark:shadow-purple-900' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-600',text: 'text-orange-700 dark:text-orange-300', glow: 'shadow-orange-200 dark:shadow-orange-900' },
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-300 dark:border-blue-600',   text: 'text-blue-700 dark:text-blue-300',    glow: 'shadow-blue-200 dark:shadow-blue-900' },
    teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',     border: 'border-teal-300 dark:border-teal-600',   text: 'text-teal-700 dark:text-teal-300',    glow: 'shadow-teal-200 dark:shadow-teal-900' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-300 dark:border-indigo-600',text: 'text-indigo-700 dark:text-indigo-300',glow: 'shadow-indigo-200 dark:shadow-indigo-900' },
    gray:   { bg: 'bg-gray-50 dark:bg-gray-800',        border: 'border-gray-300 dark:border-gray-600',   text: 'text-gray-700 dark:text-gray-300',    glow: 'shadow-gray-200 dark:shadow-gray-700' },
    slate:  { bg: 'bg-slate-50 dark:bg-slate-800',      border: 'border-slate-300 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-300',   glow: 'shadow-slate-200 dark:shadow-slate-700' },
};

const TITLE_STYLES: Record<string, string> = {
    gold:   'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
    blue:   'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    green:  'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    gray:   'bg-gradient-to-r from-gray-400 to-slate-500 text-white',
    slate:  'bg-gradient-to-r from-slate-400 to-gray-500 text-white',
};

// ── Komponen Avatar ─────────────────────────────────────────
function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
    const initials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const sizeClass = size === 'lg'
        ? 'w-20 h-20 text-2xl'
        : 'w-10 h-10 text-sm';

    return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0`}>
            {initials}
        </div>
    );
}

// ── Komponen Kartu Lencana ───────────────────────────────────
function BadgeCard({ badge }: { badge: Badge }) {
    const style = BADGE_STYLES[badge.color] ?? BADGE_STYLES.gray;
    return (
        <div className={`
            relative flex flex-col items-center gap-2 p-4 rounded-xl border-2
            ${style.bg} ${style.border}
            shadow-md ${style.glow}
            transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg
        `}>
            <span className="text-3xl leading-none">{badge.icon}</span>
            <p className={`text-xs font-bold text-center leading-tight ${style.text}`}>{badge.name}</p>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10 text-center shadow-xl transition-opacity">
                {badge.description}
            </div>
        </div>
    );
}

// ── Komponen Kartu Statistik ─────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}) {
    return (
        <div className="flex flex-col gap-1 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-1`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
            {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
        </div>
    );
}

// ── Komponen Input ───────────────────────────────────────────
function FormInput({
    id, label, icon: Icon, error, children,
}: {
    id: string;
    label: string;
    icon: React.ElementType;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Icon className="h-4 w-4" />
                {label}
            </label>
            {children}
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ── Halaman Utama ────────────────────────────────────────────
export default function Profile({
    mustVerifyEmail,
    status,
    stats,
    badges,
    title,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    stats?: Stats;
    badges?: Badge[];
    title?: TitleInfo;
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
        patch(route('profile.update'), { preserveScroll: true });
    };

    const handleSendVerification = () => {
        setVerificationSending(true);
        sendVerification(route('verification.send'), {
            preserveScroll: true,
            onFinish: () => setVerificationSending(false),
        });
    };

    const getRoleLabel = (role: string) => {
        const map: Record<string, string> = {
            student: 'Mahasiswa',
            instructor: 'Dosen',
            admin: 'Administrator',
        };
        return map[role] ?? role;
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
        });

    // Progress modul (0–100)
    const moduleProgress = stats && stats.total_modules > 0
        ? Math.round((stats.completed_modules / stats.total_modules) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Profil" />

            <SettingsLayout>
                <div className="space-y-8">

                    {/* ── Kartu Identitas ─────────────────────────────────── */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl">
                        {/* Dekorasi latar */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            {/* Avatar */}
                            <Avatar name={user.name} size="lg" />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold truncate">{user.name}</h2>
                                    {title && (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${TITLE_STYLES[title.color]}`}>
                                            {title.icon} {title.label}
                                        </span>
                                    )}
                                </div>

                                <p className="text-blue-100 text-sm truncate mb-1">{user.email}</p>

                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    {/* Peran */}
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white text-xs font-medium">
                                        <User className="w-3 h-3" />
                                        {getRoleLabel(user.role)}
                                    </span>

                                    {/* NIM */}
                                    {isStudent && user.nim && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white text-xs font-medium">
                                            <Hash className="w-3 h-3" />
                                            {user.nim}
                                        </span>
                                    )}

                                    {/* Poin */}
                                    {isStudent && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold">
                                            <Flame className="w-3 h-3" />
                                            {(user.point_fire ?? stats?.points ?? 0).toLocaleString('id-ID')} poin
                                        </span>
                                    )}

                                    {/* Peringkat */}
                                    {isStudent && stats && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white text-xs font-medium">
                                            <Trophy className="w-3 h-3" />
                                            Peringkat #{stats.rank}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Progress bar modul */}
                        {isStudent && stats && (
                            <div className="relative mt-5 pt-4 border-t border-white/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-blue-100 flex items-center gap-1">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Kemajuan Modul
                                    </span>
                                    <span className="text-xs font-bold text-white">
                                        {stats.completed_modules}/{stats.total_modules} ({moduleProgress}%)
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-300 to-emerald-400 rounded-full transition-all duration-700"
                                        style={{ width: `${moduleProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Statistik ────────────────────────────────────────── */}
                    {isStudent && stats && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                Statistik Pembelajaran
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatCard
                                    icon={BookOpen}
                                    label="Modul Selesai"
                                    value={stats.completed_modules}
                                    sub={`dari ${stats.total_modules} modul`}
                                    color="bg-blue-500"
                                />
                                <StatCard
                                    icon={ClipboardList}
                                    label="Kuis Diikuti"
                                    value={stats.total_quizzes}
                                    sub={`${stats.first_attempt_wins}× lulus 1 percobaan`}
                                    color="bg-indigo-500"
                                />
                                <StatCard
                                    icon={Upload}
                                    label="Tugas Dikumpulkan"
                                    value={stats.total_submissions}
                                    sub={`${stats.on_time_count} tepat waktu`}
                                    color="bg-emerald-500"
                                />
                                <StatCard
                                    icon={Trophy}
                                    label="Peringkat"
                                    value={`#${stats.rank}`}
                                    sub="di antara semua mahasiswa"
                                    color="bg-amber-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Lencana ──────────────────────────────────────────── */}
                    {isStudent && badges && badges.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4 text-purple-500" />
                                Lencana yang Diraih
                                <span className="ml-auto text-xs font-normal text-gray-500">
                                    {badges.length} lencana
                                </span>
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 group">
                                {badges.map(badge => (
                                    <div key={badge.id} className="group/badge relative">
                                        <BadgeCard badge={badge} />
                                        {/* Tooltip muncul saat hover */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover/badge:opacity-100 pointer-events-none z-20 text-center shadow-xl transition-opacity duration-150">
                                            <p className="font-bold mb-0.5">{badge.name}</p>
                                            <p className="text-gray-300">{badge.description}</p>
                                            {/* Panah tooltip */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pesan kosong jika belum ada lencana */}
                    {isStudent && badges && badges.length === 0 && (
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
                            <Award className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada lencana yang diraih</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Selesaikan modul, kuis, dan tugas untuk mendapatkan lencana.</p>
                        </div>
                    )}

                    {/* ── Formulir Profil ──────────────────────────────────── */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                Informasi Profil
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Perbarui nama, surel, dan data diri Anda.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Nama */}
                            <FormInput id="name" label="Nama Lengkap" icon={User} error={errors.name}>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                    placeholder="Masukkan nama lengkap Anda"
                                    required
                                    autoComplete="name"
                                />
                            </FormInput>

                            {/* NIM — hanya mahasiswa */}
                            {isStudent && (
                                <FormInput id="nim" label="NIM (Nomor Induk Mahasiswa)" icon={Hash} error={errors.nim}>
                                    <input
                                        id="nim"
                                        type="text"
                                        value={data.nim}
                                        onChange={(e) => setData('nim', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm font-mono"
                                        placeholder="Contoh: 123456789"
                                        autoComplete="off"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        NIM akan ditampilkan pada profil dan sertifikat Anda.
                                    </p>
                                </FormInput>
                            )}

                            {/* Surel */}
                            <FormInput id="email" label="Alamat Surel" icon={Mail} error={errors.email}>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                    placeholder="nama@contoh.com"
                                    required
                                    autoComplete="username"
                                />
                            </FormInput>

                            {/* Peringatan verifikasi surel */}
                            {mustVerifyEmail && !user.email_verified_at && (
                                <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                                            Alamat surel Anda belum terverifikasi.
                                        </p>
                                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                                            Klik tautan yang telah dikirimkan ke surel Anda untuk menyelesaikan verifikasi.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleSendVerification}
                                            disabled={verificationSending}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            {verificationSending ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Kirim Ulang Tautan Verifikasi
                                                </>
                                            )}
                                        </button>
                                        {status === 'verification-link-sent' && (
                                            <p className="mt-3 text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                                                <CheckCircle className="h-4 w-4" />
                                                Tautan verifikasi baru telah dikirim.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notifikasi berhasil */}
                            {recentlySuccessful && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Informasi profil berhasil diperbarui!
                                    </p>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Informasi Akun ───────────────────────────────────── */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-500" />
                            Informasi Akun
                        </h3>
                        <dl className="divide-y divide-gray-100 dark:divide-gray-700">
                            {[
                                {
                                    label: 'Peran',
                                    icon: User,
                                    value: (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.role === 'student'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : user.role === 'instructor'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    ),
                                },
                                {
                                    label: 'Bergabung sejak',
                                    icon: Calendar,
                                    value: <span className="text-sm text-gray-900 dark:text-white">{formatDate(user.created_at)}</span>,
                                },
                                {
                                    label: 'Status Surel',
                                    icon: Mail,
                                    value: user.email_verified_at ? (
                                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4" /> Terverifikasi
                                        </span>
                                    ) : (
                                        <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" /> Belum terverifikasi
                                        </span>
                                    ),
                                },
                                ...(isStudent && user.nim
                                    ? [{
                                        label: 'NIM',
                                        icon: Hash,
                                        value: <span className="text-sm font-mono text-gray-900 dark:text-white">{user.nim}</span>,
                                    }]
                                    : []
                                ),
                            ].map(({ label, icon: Icon, value }) => (
                                <div key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                    <dt className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
