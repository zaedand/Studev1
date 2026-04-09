import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import {
    User, Lock, Palette, ChevronRight,
    Trophy, Flame, Star, Shield, BookOpen
} from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    { title: 'Profil',       href: '/settings/profile',    icon: User    },
    { title: 'Kata Sandi',   href: '/settings/password',   icon: Lock    },
    { title: 'Tampilan',     href: '/settings/appearance',  icon: Palette },
];

// ── Helpers ──────────────────────────────────────────────────
const getInitials = (name: string): string =>
    name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);

const getAvatarColor = (name: string): string => {
    const colors = [
        'from-blue-500 to-blue-600',
        'from-purple-500 to-purple-600',
        'from-emerald-500 to-emerald-600',
        'from-orange-500 to-orange-600',
        'from-pink-500 to-pink-600',
        'from-teal-500 to-teal-600',
        'from-indigo-500 to-indigo-600',
    ];
    const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[idx % colors.length];
};

const TITLE_STYLES: Record<string, string> = {
    gold:   'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
    blue:   'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    green:  'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    gray:   'bg-gradient-to-r from-gray-400 to-slate-500 text-white',
    slate:  'bg-gradient-to-r from-slate-400 to-gray-500 text-white',
};

const ROLE_STYLE: Record<string, string> = {
    student:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    instructor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    admin:      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const getRoleLabel = (role: string) =>
    ({ student: 'Mahasiswa', instructor: 'Dosen', admin: 'Administrator' }[role] ?? role);

// ── Komponen Avatar ──────────────────────────────────────────
function SidebarAvatar({ name, avatar }: { name: string; avatar?: string | null }) {
    return (
        <div className="relative">
            {avatar ? (
                <img
                    src={avatar}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-md"
                />
            ) : (
                <div className={cn(
                    'w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center',
                    'ring-4 ring-white dark:ring-gray-800 shadow-md font-bold text-xl text-white',
                    getAvatarColor(name)
                )}>
                    {getInitials(name)}
                </div>
            )}
            {/* Status daring */}
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        </div>
    );
}

// ── Komponen Mini-Statistik ──────────────────────────────────
function MiniStat({ label, value, icon: Icon }: {
    label: string;
    value: string | number;
    icon: React.ElementType;
}) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    );
}

// ── Layout Utama ─────────────────────────────────────────────
export default function SettingsLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') return null;

    const currentPath = window.location.pathname;
    const page        = usePage().props as any;
    const user        = page.auth?.user;

    // Data dari ProfileController (hanya tersedia di halaman profil)
    const stats  = page.stats  as Record<string, any> | undefined;
    const badges = page.badges as Array<{ id: string; name: string; icon: string; color: string; description: string }> | undefined;
    const title  = page.title  as { label: string; color: string; icon: string } | undefined;

    const userName  = user?.name  ?? 'Pengguna';
    const userEmail = user?.email ?? '';
    const userAvatar= user?.avatar ?? null;
    const userRole  = user?.role   ?? 'student';
    const isStudent = userRole === 'student';

    const points = user?.point_fire ?? stats?.points ?? 0;
    const rank   = stats?.rank;
    const completedModules = stats?.completed_modules ?? 0;
    const totalModules     = stats?.total_modules ?? 0;
    const moduleProgress   = totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    return (
        <div className="px-4 py-6 lg:px-8">
            {/* Judul halaman */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Pengaturan
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kelola akun dan preferensi Anda
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* ── Bilah Samping ─────────────────────────────────── */}
                <aside className="w-full lg:w-64 shrink-0 space-y-3">

                    {/* Kartu profil */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">

                        {/* Banner gradien */}
                        <div className="h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative">
                            {/* Lingkaran dekoratif */}
                            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                            <div className="absolute -bottom-3 left-8 w-12 h-12 rounded-full bg-white/10" />
                        </div>

                        <div className="px-5 pb-5">
                            {/* Avatar — setengah muncul dari banner */}
                            <div className="flex items-end justify-between -mt-8 mb-3">
                                <SidebarAvatar name={userName} avatar={userAvatar} />

                                {/* Gelar */}
                                {isStudent && title && (
                                    <span className={cn(
                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm',
                                        TITLE_STYLES[title.color] ?? TITLE_STYLES.slate
                                    )}>
                                        {title.icon} {title.label}
                                    </span>
                                )}
                            </div>

                            {/* Nama & surel */}
                            <p className="font-bold text-gray-900 dark:text-white leading-tight truncate">
                                {userName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-3">
                                {userEmail}
                            </p>

                            {/* Lencana peran + peringkat */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                <span className={cn(
                                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                    ROLE_STYLE[userRole] ?? ROLE_STYLE.student
                                )}>
                                    {getRoleLabel(userRole)}
                                </span>

                                {isStudent && rank && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                        <Trophy className="w-3 h-3" />
                                        #{rank}
                                    </span>
                                )}
                            </div>

                            {/* Statistik ringkas — hanya mahasiswa */}
                            {isStudent && (
                                <div className="flex items-center justify-around py-3 border-t border-gray-100 dark:border-gray-700">
                                    <MiniStat
                                        label="Poin"
                                        value={points.toLocaleString('id-ID')}
                                        icon={Flame}
                                    />
                                    <div className="h-8 w-px bg-gray-100 dark:bg-gray-700" />
                                    <MiniStat
                                        label="Modul"
                                        value={`${completedModules}/${totalModules}`}
                                        icon={BookOpen}
                                    />
                                    <div className="h-8 w-px bg-gray-100 dark:bg-gray-700" />
                                    <MiniStat
                                        label="Lencana"
                                        value={badges?.length ?? 0}
                                        icon={Star}
                                    />
                                </div>
                            )}

                            {/* Progress bar modul */}
                            {isStudent && totalModules > 0 && (
                                <div className="mt-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Kemajuan</span>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{moduleProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                                            style={{ width: `${moduleProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pratampil lencana — hanya jika ada */}
                            {isStudent && badges && badges.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        Lencana terbaru
                                    </p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {badges.slice(0, 5).map(b => (
                                            <span
                                                key={b.id}
                                                title={b.description}
                                                className="text-lg leading-none cursor-default"
                                            >
                                                {b.icon}
                                            </span>
                                        ))}
                                        {badges.length > 5 && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">
                                                +{badges.length - 5}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigasi */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
                        <nav className="space-y-0.5">
                            {sidebarNavItems.map((item, i) => {
                                const Icon     = item.icon;
                                const isActive = currentPath === item.href;

                                return (
                                    <Link
                                        key={`${item.href}-${i}`}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                                            isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                        )}
                                    >
                                        {Icon && (
                                            <div className={cn(
                                                'p-1.5 rounded-lg transition-colors',
                                                isActive
                                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                                            )}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                        )}
                                        <span className={cn(
                                            'text-sm flex-1',
                                            isActive ? 'font-semibold' : 'font-medium'
                                        )}>
                                            {item.title}
                                        </span>
                                        <ChevronRight className={cn(
                                            'h-3.5 w-3.5 transition-all',
                                            isActive
                                                ? 'opacity-100 translate-x-0.5 text-blue-500'
                                                : 'opacity-0 group-hover:opacity-60'
                                        )} />
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Kiat keamanan */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                        <div className="flex items-start gap-2.5">
                            <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                Jaga keamanan akun Anda dengan menggunakan kata sandi yang kuat dan unik.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Pemisah tampilan seluler */}
                <div className="lg:hidden border-t border-gray-200 dark:border-gray-700" />

                {/* ── Konten Utama ──────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 shadow-sm">
                        {children}
                    </div>
                </div>

            </div>
        </div>
    );
}
