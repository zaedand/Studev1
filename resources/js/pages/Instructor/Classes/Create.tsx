/**
 * resources/js/pages/Instructor/Classes/Create.tsx
 * instructor_id tidak dikirim dari form — di-set otomatis di controller.
 */
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Manajemen Kelas', href: '/instructor/classes' },
    { title: 'Buat Kelas', href: '#' },
];

export default function ClassCreate() {
    const { flash } = usePage<any>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name:        '',
        description: '',
        is_active:   true,
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/instructor/classes', { onSuccess: () => reset() });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Kelas Baru" />
            <Toaster position="top-right" toastOptions={{
                style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '10px', border: '1px solid #374151' },
                success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
            }} />

            <div className="max-w-2xl mx-auto flex flex-col gap-5 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl">
                    <Link href="/instructor/classes" className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buat Kelas Baru</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Isi informasi kelas berikut</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
                    {/* Nama */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Nama Kelas <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Contoh: Kelas Pemrograman A"
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Deskripsi <span className="font-normal text-gray-400 normal-case">(opsional)</span>
                        </label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            placeholder="Tujuan dan informasi kelas..."
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="w-4 h-4 accent-purple-600"
                        />
                        <label htmlFor="is_active" className="text-sm cursor-pointer">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">Kelas Aktif</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Kelas aktif terlihat oleh mahasiswa</span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <Link href="/instructor/classes" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                        <X className="h-4 w-4" />
                        Batal
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm px-5 py-2.5 rounded-lg transition-colors font-semibold"
                    >
                        <Save className="h-4 w-4" />
                        {processing ? 'Menyimpan...' : 'Buat Kelas'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
