import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Trophy,
    Medal,
    Crown,
    Star,
    TrendingUp,
    User,
    Award,
    Clock,
    Target,
    Zap
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Leaderboard',
        href: '/leaderboard',
    },
];

// Data dummy untuk leaderboard
const leaderboardData = [
    {
        id: 1,
        rank: 1,
        name: 'Ahmad Rizki',
        avatar: 'AR',
        points: 4850,
        completedModules: 8,
        totalModules: 8,
        level: 'Master',
        streak: 15,
        badges: ['🏆', '🔥', '⭐', '💎']
    },
    {
        id: 2,
        rank: 2,
        name: 'Sari Dewi',
        avatar: 'SD',
        points: 4320,
        completedModules: 7,
        totalModules: 8,
        level: 'Expert',
        streak: 12,
        badges: ['🏆', '🔥', '⭐']
    },
    {
        id: 3,
        rank: 3,
        name: 'Budi Santoso',
        avatar: 'BS',
        points: 3890,
        completedModules: 6,
        totalModules: 8,
        level: 'Advanced',
        streak: 8,
        badges: ['🏆', '🔥']
    },
    {
        id: 4,
        rank: 4,
        name: 'Maya Putri',
        avatar: 'MP',
        points: 3450,
        completedModules: 6,
        totalModules: 8,
        level: 'Advanced',
        streak: 10,
        badges: ['🏆', '⭐']
    },
    {
        id: 5,
        rank: 5,
        name: 'You',
        avatar: 'YU',
        points: 2450,
        completedModules: 2,
        totalModules: 8,
        level: 'Intermediate',
        streak: 5,
        badges: ['🔥'],
        isCurrentUser: true
    },
    {
        id: 6,
        rank: 6,
        name: 'Dika Pratama',
        avatar: 'DP',
        points: 2180,
        completedModules: 3,
        totalModules: 8,
        level: 'Intermediate',
        streak: 3,
        badges: ['⭐']
    },
    {
        id: 7,
        rank: 7,
        name: 'Lisa Maharani',
        avatar: 'LM',
        points: 1950,
        completedModules: 2,
        totalModules: 8,
        level: 'Beginner',
        streak: 7,
        badges: ['🔥']
    },
    {
        id: 8,
        rank: 8,
        name: 'Rendi Kurniawan',
        avatar: 'RK',
        points: 1720,
        completedModules: 2,
        totalModules: 8,
        level: 'Beginner',
        streak: 2,
        badges: []
    }
];

// Data statistik global
const globalStats = {
    totalStudents: 45,
    averagePoints: 2850,
    topStreak: 15,
    completionRate: 42
};

export default function Leaderboard() {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Award className="h-6 w-6 text-orange-500" />;
            default:
                return <span className="text-lg font-bold text-gray-500 dark:text-gray-400">#{rank}</span>;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Master':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'Expert':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'Advanced':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Intermediate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leaderboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Leaderboard
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                        Kompetisi sehat untuk meningkatkan motivasi belajar programming
                    </p>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {globalStats.totalStudents}
                                </p>
                            </div>
                            <User className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Average Points</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {globalStats.averagePoints.toLocaleString()}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Top Streak</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {globalStats.topStreak} days
                                </p>
                            </div>
                            <Zap className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {globalStats.completionRate}%
                                </p>
                            </div>
                            <Target className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Top 3 Podium */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Crown className="h-6 w-6 text-yellow-500" />
                        Top 3 Champions
                    </h2>

                    <div className="flex justify-center items-end gap-8">
                        {/* 2nd Place */}
                        <div className="text-center">
                            <div className="bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500 w-24 h-16 rounded-t-lg flex items-end justify-center pb-2">
                                <span className="text-white font-bold text-lg">2</span>
                            </div>
                            <div className="mt-4">
                                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                                    {leaderboardData[1].avatar}
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {leaderboardData[1].name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {leaderboardData[1].points.toLocaleString()} pts
                                </p>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="text-center">
                            <div className="bg-gradient-to-t from-yellow-400 to-yellow-300 w-24 h-24 rounded-t-lg flex items-end justify-center pb-2">
                                <Crown className="h-8 w-8 text-white" />
                            </div>
                            <div className="mt-4">
                                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 ring-4 ring-yellow-300">
                                    {leaderboardData[0].avatar}
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                    {leaderboardData[0].name}
                                </h3>
                                <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                    {leaderboardData[0].points.toLocaleString()} pts
                                </p>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="text-center">
                            <div className="bg-gradient-to-t from-orange-400 to-orange-300 w-24 h-12 rounded-t-lg flex items-end justify-center pb-2">
                                <span className="text-white font-bold text-lg">3</span>
                            </div>
                            <div className="mt-4">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                                    {leaderboardData[2].avatar}
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {leaderboardData[2].name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {leaderboardData[2].points.toLocaleString()} pts
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Leaderboard */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Full Rankings
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Points
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Streak
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Badges
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {leaderboardData.map((student) => (
                                    <tr
                                        key={student.id}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                            student.isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getRankIcon(student.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                    student.isCurrentUser ? 'bg-blue-500' : 'bg-gray-400'
                                                }`}>
                                                    {student.avatar}
                                                </div>
                                                <div>
                                                    <div className={`font-medium ${
                                                        student.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                        {student.name}
                                                        {student.isCurrentUser && (
                                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`text-sm px-2 py-1 rounded inline-block ${getLevelColor(student.level)}`}>
                                                        {student.level}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {student.points.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${(student.completedModules / student.totalModules) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {student.completedModules}/{student.totalModules}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Zap className="h-4 w-4 text-orange-500" />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {student.streak}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                {student.badges.map((badge, index) => (
                                                    <span key={index} className="text-lg">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Achievement Guide */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🏆 How to Earn Points & Badges
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Point System:</h4>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                <li>• Complete lesson: +50 points</li>
                                <li>• Finish module: +200 points</li>
                                <li>• Perfect quiz score: +100 points</li>
                                <li>• Daily streak: +25 points</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Badge Requirements:</h4>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                <li>🏆 Complete 3+ modules</li>
                                <li>🔥 7+ day learning streak</li>
                                <li>⭐ 90%+ average quiz score</li>
                                <li>💎 Complete all modules</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
