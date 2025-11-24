import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { User, Lock, Palette, ChevronRight, Camera, Trophy, Star } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: User,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: Lock,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: Palette,
    },
];

// Fungsi untuk mendapatkan inisial dari nama
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Fungsi untuk generate warna berdasarkan nama
const getAvatarColor = (name: string): string => {
    const colors = [
        'from-blue-500 to-blue-600',
        'from-purple-500 to-purple-600',
        'from-green-500 to-green-600',
        'from-orange-500 to-orange-600',
        'from-pink-500 to-pink-600',
        'from-teal-500 to-teal-600',
        'from-indigo-500 to-indigo-600',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
};

export default function SettingsLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    // Ambil data user dari Inertia
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const userName = user?.name || 'User Name';
    const userEmail = user?.email || 'user@example.com';
    const userAvatar = user?.avatar || null;
    const userRole = user?.role || 'student';
    const userRank = user?.rank || null;
    const userPoints = user?.points || 0;
    const userLevel = user?.level || 'Beginner';

    // Cek apakah user adalah student
    const isStudent = userRole === 'student';

    // Fungsi untuk mendapatkan label role
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'student': return 'Mahasiswa';
            case 'instructor': return 'Dosen';
            case 'admin': return 'Admin';
            default: return role;
        }
    };

    // Fungsi untuk mendapatkan style badge role
    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'instructor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    // Fungsi untuk mendapatkan warna badge peringkat
    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        if (rank === 2) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        if (rank === 3) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    };

    // Fungsi untuk mendapatkan ikon peringkat
    const getRankIcon = (rank: number) => {
        if (rank <= 3) return <Trophy className="w-3 h-3" />;
        return <Star className="w-3 h-3" />;
    };

    return (
        <div className="px-4 py-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-72 shrink-0">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
                        <div className="flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="relative group">
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-700"
                                    />
                                ) : (
                                    <div className={cn(
                                        'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center ring-4 ring-gray-100 dark:ring-gray-700 shadow-lg',
                                        getAvatarColor(userName)
                                    )}>
                                        <span className="text-2xl font-bold text-white">
                                            {getInitials(userName)}
                                        </span>
                                    </div>
                                )}
                                {/* Upload Button Overlay */}
                                <button className="absolute inset-0 w-20 h-20 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                                {/* Online Status */}
                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                            </div>

                            {/* User Info */}
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                {userName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {userEmail}
                            </p>

                            {/* Status & Rank Badges */}
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                {/* Role Badge */}
                                <span className={cn(
                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    getRoleBadgeStyle(userRole)
                                )}>
                                    {getRoleLabel(userRole)}
                                </span>

                                {/* Peringkat - Hanya untuk Student */}
                                {isStudent && userRank && (
                                    <span className={cn(
                                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                                        getRankStyle(userRank)
                                    )}>
                                        {getRankIcon(userRank)}
                                        Peringkat #{userRank}
                                    </span>
                                )}
                            </div>

                            {/* Points & Level - Hanya untuk Student */}
                            {isStudent && (
                                <div className="mt-4 w-full pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-around text-center">
                                        <div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{userPoints.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
                                        </div>
                                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                                        <div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{userLevel}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
                        <nav className="space-y-1">
                            {sidebarNavItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = currentPath === item.href;

                                return (
                                    <Link
                                        key={`${item.href}-${index}`}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                                            isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        )}
                                    >
                                        {Icon && (
                                            <div className={cn(
                                                'p-2 rounded-lg transition-colors',
                                                isActive
                                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                                            )}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        )}
                                        <span className={cn(
                                            'text-sm font-medium flex-1',
                                            isActive && 'font-semibold'
                                        )}>
                                            {item.title}
                                        </span>
                                        <ChevronRight className={cn(
                                            'h-4 w-4 transition-transform',
                                            isActive && 'translate-x-1',
                                            !isActive && 'opacity-0 group-hover:opacity-100'
                                        )} />
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Quick Info Card */}
                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Keep your account secure by using a strong password and enabling two-factor authentication.
                        </p>
                    </div>
                </aside>

                {/* Separator for mobile */}
                <div className="lg:hidden border-t border-gray-200 dark:border-gray-700" />

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
