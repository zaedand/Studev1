import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    FileText,
    Video,
    ClipboardList,
    Upload,
    Flame,
    Clock,
    CheckCircle,
    ArrowLeft,
    Download,
    Play,
    Globe,
    Target,
    BookOpenCheck,
    Lightbulb,
    PenTool,
    Calendar,
    AlertCircle,
    Trophy
} from 'lucide-react';

// Data dummy untuk modul (biasanya dari props/API)
const moduleData = {
    id: 2,
    title: 'Looping & Perulangan',
    description: 'Pelajari konsep perulangan dalam pemrograman menggunakan For, While, dan Do-While loops dengan berbagai contoh implementasi praktis.',
    color: 'bg-green-500',
    progress: 60,
    totalLessons: 8,
    completedLessons: 5,
    estimatedTime: '4-6 jam',
    difficulty: 'Intermediate',
    prerequisites: ['Pengenalan Pemrograman', 'Variabel & Operator']
};

// Data dummy untuk konten modul
const moduleContent = {
    cp: {
        title: 'Capaian Pembelajaran (CP)',
        description: 'Tujuan pembelajaran yang akan dicapai dalam modul ini',
        points: 10,
        completed: false,
        content: [
            'Memahami konsep dasar perulangan dalam pemrograman',
            'Mampu mengimplementasikan For Loop untuk iterasi terhitung',
            'Menguasai While dan Do-While loop untuk iterasi kondisional',
            'Dapat menyelesaikan masalah dengan nested loop',
            'Memahami kapan menggunakan jenis loop yang tepat'
        ]
    },
    atp: {
        title: 'Alur Tujuan Pembelajaran (ATP)',
        description: 'Langkah-langkah pembelajaran sistematis',
        points: 10,
        completed: true,
        content: [
            'Pertemuan 1: Konsep dasar perulangan dan flowchart',
            'Pertemuan 2: Implementasi For Loop',
            'Pertemuan 3: While dan Do-While Loop',
            'Pertemuan 4: Nested Loop dan optimasi',
            'Pertemuan 5: Studi kasus dan problem solving'
        ]
    },
    materi: {
        title: 'Materi PDF',
        description: 'Bahan bacaan utama dalam format PDF',
        points: 50,
        completed: false,
        fileName: 'Modul_02_Looping_Perulangan.pdf',
        fileSize: '2.4 MB',
        readProgress: 65,
        canDownload: false // akan true jika sudah dibaca sampai akhir
    },
    pengayaan: {
        title: 'Pengayaan & Sumber Lain',
        description: 'Video pembelajaran dan sumber tambahan',
        points: 30,
        completed: false,
        videos: [
            {
                id: 1,
                title: 'For Loop Fundamentals',
                platform: 'YouTube',
                duration: '15:30',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                watched: true
            },
            {
                id: 2,
                title: 'While Loop Deep Dive',
                platform: 'YouTube',
                duration: '22:45',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                watched: false
            }
        ],
        links: [
            {
                title: 'MDN Web Docs - Loops and iteration',
                url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration',
                type: 'Documentation'
            },
            {
                title: 'GeeksforGeeks - Loop Control Statements',
                url: 'https://www.geeksforgeeks.org/loops-in-c-and-cpp/',
                type: 'Tutorial'
            },
            {
                title: 'Stack Overflow - Loop Best Practices',
                url: 'https://stackoverflow.com/questions/tagged/loops',
                type: 'Forum'
            }
        ]
    },
    quiz: {
        title: 'Quiz',
        description: 'Kerjakan 10 soal untuk menguji pemahaman',
        points: 100,
        completed: false,
        totalQuestions: 10,
        timeLimit: 30, // minutes
        attempts: 1,
        maxAttempts: 3,
        bestScore: null
    },
    praktikum: {
        title: 'Tugas Praktikum',
        description: 'Implementasi program dengan loop',
        points: 150,
        completed: false,
        deadline: '2025-09-15 23:59:00',
        submitted: false,
        submissionFile: null,
        tasks: [
            'Buat program untuk menampilkan pola segitiga dengan loop',
            'Implementasikan algoritma pencarian dengan iterasi',
            'Optimasi performa loop untuk data besar'
        ]
    }
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Modul Pembelajaran', href: '/dashboard' },
    { title: moduleData.title, href: `/module/${moduleData.id}` },
];

export default function ModuleDetail() {
    // Fungsi untuk format deadline
    const formatDeadline = (deadline) => {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days > 0) {
            return `${days} hari lagi`;
        } else if (days === 0) {
            return 'Hari ini';
        } else {
            return `Terlambat ${Math.abs(days)} hari`;
        }
    };

    const ContentCard = ({ content, type, icon: Icon }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${moduleData.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {content.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {content.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {content.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">{content.points}</span>
                    </div>
                </div>
            </div>

            {/* Content berdasarkan type */}
            {type === 'cp' && (
                <div className="space-y-3">
                    {content.content.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {item}
                            </span>
                        </div>
                    ))}
                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Lihat Detail CP
                    </button>
                </div>
            )}

            {type === 'atp' && (
                <div className="space-y-3">
                    {content.content.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold flex-shrink-0">
                                {index + 1}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {item}
                            </span>
                        </div>
                    ))}
                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Lihat Alur Lengkap
                    </button>
                </div>
            )}

            {type === 'materi' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-red-500" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {content.fileName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {content.fileSize}
                                </p>
                            </div>
                        </div>
                        {content.canDownload ? (
                            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Baca sampai akhir untuk download
                            </span>
                        )}
                    </div>

                    {/* Progress membaca */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress Membaca</span>
                            <span className="text-gray-600 dark:text-gray-400">{content.readProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${content.readProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Buka PDF
                    </button>
                </div>
            )}

            {type === 'pengayaan' && (
                <div className="space-y-4">
                    {/* Video Section */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Video Pembelajaran</h4>
                        <div className="space-y-3">
                            {content.videos.map((video) => (
                                <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="relative">
                                        <div className="w-16 h-12 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {!video.watched && (
                                            <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                                            {video.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {video.platform} • {video.duration}
                                        </p>
                                    </div>
                                    {video.watched && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links Section */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sumber Tambahan</h4>
                        <div className="space-y-2">
                            {content.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Globe className="h-4 w-4 text-blue-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {link.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {link.type}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Mulai Pengayaan
                    </button>
                </div>
            )}

            {type === 'quiz' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {content.totalQuestions}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Soal</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {content.timeLimit}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Menit</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Percobaan: {content.attempts}/{content.maxAttempts}
                        </span>
                        {content.bestScore && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                                Skor Terbaik: {content.bestScore}/100
                            </span>
                        )}
                    </div>

                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <PenTool className="h-4 w-4" />
                        Mulai Quiz
                    </button>
                </div>
            )}

            {type === 'praktikum' && (
                <div className="space-y-4">
                    {/* Deadline Info */}
                    <div className={`p-3 rounded-lg border ${
                        formatDeadline(content.deadline).includes('Terlambat')
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}>
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 ${
                                formatDeadline(content.deadline).includes('Terlambat')
                                    ? 'text-red-500'
                                    : 'text-blue-500'
                            }`} />
                            <span className={`text-sm font-medium ${
                                formatDeadline(content.deadline).includes('Terlambat')
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-blue-700 dark:text-blue-400'
                            }`}>
                                Deadline: {formatDeadline(content.deadline)}
                            </span>
                        </div>
                    </div>

                    {/* Tasks */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tugas:</h4>
                        <div className="space-y-2">
                            {content.tasks.map((task, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {task}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upload Section */}
                    {content.submitted ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-green-700 dark:text-green-400 font-medium">
                                    Tugas sudah dikumpulkan
                                </span>
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                File: {content.submissionFile}
                            </p>
                        </div>
                    ) : (
                        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Laporan (.pdf)
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${moduleData.title} - Module Detail`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">

                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-start gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                    </div>

                    <div className="flex items-start justify-between mt-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-3 rounded-lg ${moduleData.color}`}>
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Modul {moduleData.id}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {moduleData.title}
                            </h1>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {moduleData.description}
                            </p>

                            {/* Module Stats */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {moduleData.estimatedTime}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {moduleData.difficulty}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpenCheck className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {moduleData.completedLessons}/{moduleData.totalLessons} lessons
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Circle */}
                        <div className="flex flex-col items-center">
                            <div className="relative w-20 h-20">
                                <svg className="w-20 h-20 transform -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-gray-200 dark:text-gray-700"
                                    />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 36}`}
                                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - moduleData.progress / 100)}`}
                                        className="text-green-500 transition-all duration-300"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {moduleData.progress}%
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Progress
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ContentCard
                        content={moduleContent.cp}
                        type="cp"
                        icon={Target}
                    />
                    <ContentCard
                        content={moduleContent.atp}
                        type="atp"
                        icon={BookOpenCheck}
                    />
                    <ContentCard
                        content={moduleContent.materi}
                        type="materi"
                        icon={FileText}
                    />
                    <ContentCard
                        content={moduleContent.pengayaan}
                        type="pengayaan"
                        icon={Lightbulb}
                    />
                    <ContentCard
                        content={moduleContent.quiz}
                        type="quiz"
                        icon={ClipboardList}
                    />
                    <ContentCard
                        content={moduleContent.praktikum}
                        type="praktikum"
                        icon={Upload}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
