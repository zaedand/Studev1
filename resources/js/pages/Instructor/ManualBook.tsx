import InstructorLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Download,
    ExternalLink,
    FileText,
    Calendar,
    HardDrive,
    BookOpen,
    ZoomIn,
    ZoomOut,
    RotateCw,
    GraduationCap
} from 'lucide-react';
import { useState } from 'react';
import { useCustomToast } from '@/hooks/use-toast';
import { Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

interface ManualBookData {
    title: string;
    file_path: string;
    file_size: string;
    file_url: string;
    last_updated: string;
}

interface PageProps extends InertiaPageProps {
    manualBook: ManualBookData;
    breadcrumbs: BreadcrumbItem[];
}

export default function InstructorManualBookIndex() {
    const { manualBook, breadcrumbs } = usePage<PageProps>().props;
    const toastHelper = useCustomToast();
    const [zoom, setZoom] = useState(100);

    const handleDownload = () => {
        toastHelper.fileDownloaded('Manual Book Instructor');
        window.location.href = route('instructor.manualbook.download');
    };

    const handleOpenNewTab = () => {
        window.open(route('instructor.manualbook.view'), '_blank');
        toastHelper.info('Manual Book dibuka di tab baru');
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 10, 50));
    };

    const handleResetZoom = () => {
        setZoom(100);
    };

    return (
        <InstructorLayout breadcrumbs={breadcrumbs}>
            <Head title="Manual Book - Panduan Instructor" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-start gap-4">
                        <Link
                            href={route('instructor.dashboard')}
                            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                    </div>

                    <div className="flex items-start justify-between mt-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {manualBook.title}
                                </h1>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Panduan lengkap untuk instructor dalam mengelola sistem pembelajaran
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Diperbarui: {manualBook.last_updated}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Ukuran: {manualBook.file_size}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                                Zoom:
                            </span>
                            <button
                                onClick={handleZoomOut}
                                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
                                {zoom}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                                onClick={handleResetZoom}
                                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                title="Reset Zoom"
                            >
                                <RotateCw className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleOpenNewTab}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                                <span>Buka di Tab Baru</span>
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="h-full w-full overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
                        <div
                            className="mx-auto bg-white dark:bg-gray-800 shadow-lg"
                            style={{
                                width: `${zoom}%`,
                                minHeight: '100%'
                            }}
                        >
                            <iframe
                                src={`${manualBook.file_url}#toolbar=0&navpanes=0&scrollbar=1`}
                                className="w-full h-full"
                                style={{
                                    minHeight: '800px',
                                    border: 'none'
                                }}
                                title="Manual Book PDF Viewer"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">
                                Panduan Manual Book Instructor
                            </p>
                            <ul className="text-sm text-purple-700 dark:text-purple-300 mt-2 space-y-1 list-disc list-inside">
                                <li>Manajemen modul pembelajaran dan konten</li>
                                <li>Pengelolaan kelas dan mahasiswa</li>
                                <li>Pembuatan dan penilaian quiz</li>
                                <li>Manajemen praktikum dan assignment</li>
                                <li>Monitoring progress dan analytics</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </InstructorLayout>
    );
}
