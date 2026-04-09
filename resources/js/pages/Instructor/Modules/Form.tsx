import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// ─────────────────────────────────────────────
// Tipe Data
// ─────────────────────────────────────────────

interface Module {
    id: number;
    title: string;
    description: string;
    order_number: number;
    cp_atp: string;
    is_active: boolean;
}

interface PageProps extends InertiaPageProps {
    module?: Module;
    nextOrderNumber?: number;
    flash?: { success?: string; error?: string };
}

// ─────────────────────────────────────────────
// Halaman Form Modul
// ─────────────────────────────────────────────

export default function ModuleForm() {
    const { module, nextOrderNumber, flash } = usePage<PageProps>().props;
    const isEditing = !!module;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/instructor/dashboard' },
        { title: 'Modul',  href: '/instructor/modules' },
        { title: isEditing ? 'Ubah Modul' : 'Buat Modul', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        title:        module?.title        || '',
        description:  module?.description  || '',
        order_number: module?.order_number || nextOrderNumber || 1,
        cp_atp:       module?.cp_atp       || '',
        is_active:    module?.is_active    ?? true,
    });

    // Flash message dari server
    useEffect(() => {
        if (flash?.success) toast.success(flash.success, { duration: 4000 });
        if (flash?.error)   toast.error(flash.error,   { duration: 5000 });
    }, [flash]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validasi sisi klien
        if (!data.title.trim()) {
            toast.error('Judul modul belum diisi.');
            return;
        }
        if (!data.description.trim()) {
            toast.error('Deskripsi modul belum diisi.');
            return;
        }
        if (!data.order_number || data.order_number < 1) {
            toast.error('Nomor urut harus berupa angka positif.');
            return;
        }

        const tid = toast.loading(isEditing ? 'Menyimpan perubahan…' : 'Membuat modul…');

        const opts = {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error(
                isEditing ? 'Gagal menyimpan perubahan. Periksa kembali formulir.' : 'Gagal membuat modul.',
                { id: tid }
            ),
        };

        if (isEditing) {
            put(`/instructor/modules/${module!.id}`, opts);
        } else {
            post('/instructor/modules', opts);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Ubah Modul' : 'Buat Modul'} />

            <Toaster position="top-right" toastOptions={{
                style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '10px', border: '1px solid #374151' },
                success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                loading: { style: { background: '#1e3a5f', color: '#bfdbfe', border: '1px solid #3b82f6' } },
            }} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                {/* ── Header ── */}
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-center gap-3">
                        <a href="/instructor/modules"
                            className="rounded-lg p-2 transition-colors hover:bg-white dark:hover:bg-gray-600">
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </a>
                        <div>
                            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                                {isEditing ? 'Ubah Modul' : 'Buat Modul Baru'}
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                {isEditing ? 'Perbarui informasi modul pembelajaran.' : 'Tambahkan modul pembelajaran baru.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Formulir ── */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <form onSubmit={submit} className="space-y-6">

                        {/* Judul */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Judul Modul <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Contoh: Pengenalan Pemrograman"
                            />
                            {errors.title && <FieldError msg={errors.title} />}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Deskripsi singkat isi modul…"
                            />
                            {errors.description && <FieldError msg={errors.description} />}
                        </div>

                        {/* Nomor Urut & Status */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nomor Urut <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number" min="1"
                                    value={data.order_number}
                                    onChange={e => setData('order_number', parseInt(e.target.value))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.order_number && <FieldError msg={errors.order_number} />}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <div className="flex h-[42px] items-center">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={e => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Aktif (terlihat oleh mahasiswa)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* CP/ATP */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Capaian Pembelajaran (CP/ATP)
                                <span className="ml-2 text-xs font-normal text-gray-400">(Opsional)</span>
                            </label>
                            <textarea
                                value={data.cp_atp}
                                onChange={e => setData('cp_atp', e.target.value)}
                                rows={6}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Tuliskan capaian pembelajaran atau ATP di sini…"
                            />
                            {errors.cp_atp && <FieldError msg={errors.cp_atp} />}
                        </div>

                        {/* Peringatan modul baru → perlu lengkapi konten */}
                        {!isEditing && (
                            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                <div className="text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-semibold">Informasi</p>
                                    <p className="mt-0.5">
                                        Setelah modul dibuat, Anda dapat menambahkan CPMK, Tujuan Pembelajaran, Materi PDF, dan Pengayaan melalui halaman detail modul.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tombol Aksi */}
                        <div className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <a href="/instructor/modules"
                                className="rounded-lg bg-gray-100 px-6 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                                Batal
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400">
                                <Save className="h-4 w-4" />
                                {processing
                                    ? 'Menyimpan…'
                                    : isEditing ? 'Simpan Perubahan' : 'Buat Modul'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

// ─────────────────────────────────────────────
// Komponen Pesan Error Field
// ─────────────────────────────────────────────

function FieldError({ msg }: { msg: string }) {
    return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{msg}</p>;
}
