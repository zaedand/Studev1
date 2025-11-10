import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Trophy,
    Medal,
    Crown,
    Award,
    User,
    Target,
    TrendingUp,
    BookOpen
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

interface Student {
    id: number;
    rank: number;
    name: string;
    avatar: string;
    points: number;
    completedModules: number;
    totalModules: number;
    level: string;
    isCurrentUser: boolean;
    joinedDate: string;
}

interface GlobalStats {
    totalStudents: number;
    averagePoints: number;
    completionRate: number;
    totalModules: number;
}

interface PageProps {
    leaderboard: Student[];
    currentUser: Student;
    globalStats: GlobalStats;
}

export default function Leaderboard() {
    const { leaderboard, currentUser, globalStats } = usePage<PageProps>().props;

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

    const top3 = leaderboard.slice(0, 3);

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
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Modules</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {globalStats.totalModules}
                                </p>
                            </div>
                            <BookOpen className="h-8 w-8 text-purple-500" />
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
                            <Target className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Top 3 Podium */}
                {top3.length >= 3 && (
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
                                        {top3[1].avatar}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {top3[1].name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {top3[1].points.toLocaleString()} pts
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {top3[1].completedModules}/{top3[1].totalModules} modules
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
                                        {top3[0].avatar}
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                        {top3[0].name}
                                    </h3>
                                    <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                        {top3[0].points.toLocaleString()} pts
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {top3[0].completedModules}/{top3[0].totalModules} modules
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
                                        {top3[2].avatar}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {top3[2].name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {top3[2].points.toLocaleString()} pts
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {top3[2].completedModules}/{top3[2].totalModules} modules
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                        Modules Completed
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Level
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {leaderboard.map((student) => (
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
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Joined {student.joinedDate}
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
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {student.completedModules} / {student.totalModules}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${(student.completedModules / student.totalModules) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {Math.round((student.completedModules / student.totalModules) * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm px-3 py-1 rounded-full inline-block ${getLevelColor(student.level)}`}>
                                                {student.level}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Your Rank Card */}
                {currentUser && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📊 Your Performance
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Your Rank</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    #{currentUser.rank}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {currentUser.points.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Modules</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {currentUser.completedModules}/{currentUser.totalModules}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {currentUser.level}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
