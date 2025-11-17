import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Trophy,
    FileText,
    Video,
    ClipboardList,
    Upload,
    Flame,
    Star,
    Clock,
    Award
} from 'lucide-react';

interface Module {
    id: number;
    title: string;
    description: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    color: string;
    icon: string;
}

interface UserStats {
    totalPoints: number;
    currentRank: number;
    totalStudents: number;
    completedModules: number;
    totalModules: number;
}

interface PageProps extends InertiaPageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            points: number;
        } | null;
    };
    modules: Module[];
    userStats: UserStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth, modules, userStats } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header dengan Points dan Rank */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Selamat Datang di StuDev, {auth.user?.name}! 🎓
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Lanjutkan perjalanan belajar programming Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                            <Flame className="h-5 w-5 text-orange-500" />
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                                {userStats.totalPoints.toLocaleString()} Points
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                Rank #{userStats.currentRank}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userStats.totalPoints.toLocaleString()}
                                </p>
                            </div>
                            <Flame className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Modules</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userStats.completedModules}/{userStats.totalModules}
                                </p>
                            </div>
                            <Award className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Current Rank</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    #{userStats.currentRank}
                                </p>
                            </div>
                            <Trophy className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userStats.totalStudents}
                                </p>
                            </div>
                            <Star className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Learning Modules Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Modul Pembelajaran
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {userStats.completedModules} dari {userStats.totalModules} modul selesai
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {modules.map((module) => (
                            <Link
                                key={module.id}
                                href={`/module/${module.id}`}
                                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
                            >
                                {/* Module Icon & Title */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg ${module.color}`}>
                                        <BookOpen className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                                        Modul {module.id}
                                    </span>
                                </div>

                                {/* Module Title */}
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {module.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {module.description}
                                </p>

                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>Progress</span>
                                        <span>{module.completedLessons}/{module.totalLessons} components</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${module.color}`}
                                            style={{ width: `${module.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {module.progress}% Complete
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/leaderboard"
                            className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-yellow-200 dark:border-yellow-800"
                        >
                            <Trophy className="h-8 w-8 text-yellow-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Leaderboard</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Lihat ranking Anda</p>
                            </div>
                        </Link>

                        <Link
                            href="/compiler"
                            className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-blue-200 dark:border-blue-800"
                        >
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Online Compiler</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Code dan test program</p>
                            </div>
                        </Link>

                        <Link
                            href="/profile"
                            className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-purple-200 dark:border-purple-800"
                        >
                            <Star className="h-8 w-8 text-purple-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Profile Settings</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Kelola profil Anda</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
