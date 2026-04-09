import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BookOpen, Users, CheckCircle2, Edit, Trash2, ArrowLeft,
    FileText, Lightbulb, ClipboardList, PlayCircle, TrendingUp,
    Calendar, BarChart3, AlertCircle, Power, Award, List, Plus,
    X, Upload, Save, Link as LinkIcon, Video, Eye, ExternalLink,
} from 'lucide-react';
import { useEffect, useState, FormEventHandler } from 'react';
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
    created_at: string;
    updated_at: string;
}
interface CPMK             { id: number; content: string[] | string; point_reward: number; }
interface LearningObjective { id: number; content: string[] | string; point_reward: number; }
interface Material          { id: number; title: string; description: string; file_name: string; file_path: string; point_reward: number; }
interface Enrichment        { id: number; title: string; description: string; type: 'video' | 'link'; url: string; order_number: number; point_reward: number; }
interface Statistics        { total_students: number; completed_students: number; completion_rate: number; total_components: number; }
interface StudentProgress   { id: number; name: string; email: string; progress_percentage: number; }

interface PageProps extends InertiaPageProps {
    module: Module;
    cpmks: CPMK[];
    learningObjectives: LearningObjective[];
    materials: Material[];
    enrichments: Enrichment[];
    quizzes: any[];
    assignments: any[];
    statistics: Statistics;
    studentProgress: StudentProgress[];
    flash?: { success?: string; error?: string };
}

// ─────────────────────────────────────────────
// Halaman Utama
// ─────────────────────────────────────────────

export default function ModuleDetail() {
    const {
        module, cpmks, learningObjectives, materials,
        enrichments, quizzes, assignments, statistics,
        studentProgress, flash,
    } = usePage<PageProps>().props;

    // Modal state
    const [showDeleteModule,        setShowDeleteModule]        = useState(false);
    const [deleteEnrichmentConfirm, setDeleteEnrichmentConfirm] = useState<Enrichment | null>(null);

    // Modal CPMK: mode 'create' | 'edit' | null
    const [cpmkModal,          setCpmkModal]          = useState<{ mode: 'create' | 'edit'; item?: CPMK } | null>(null);
    const [learningObjModal,   setLearningObjModal]   = useState<{ mode: 'create' | 'edit'; item?: LearningObjective } | null>(null);
    const [materialModal,      setMaterialModal]      = useState<{ mode: 'create' | 'edit'; item?: Material } | null>(null);
    const [enrichmentModal,    setEnrichmentModal]    = useState<{ mode: 'create' | 'edit'; item?: Enrichment } | null>(null);

    // Flash → react-hot-toast
    useEffect(() => {
        if (flash?.success) toast.success(flash.success, { duration: 4000 });
        if (flash?.error)   toast.error(flash.error,   { duration: 5000 });
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/instructor/dashboard' },
        { title: 'Modul',  href: '/instructor/modules' },
        { title: module.title, href: `/instructor/modules/${module.id}` },
    ];

    const handleDeleteModule = () => {
        const tid = toast.loading('Menghapus modul…');
        router.delete(`/instructor/modules/${module.id}`, {
            onSuccess: () => { toast.dismiss(tid); setShowDeleteModule(false); },
            onError:   () => toast.error('Gagal menghapus modul.', { id: tid }),
        });
    };

    const handleToggleActive = () => {
        const tid = toast.loading(module.is_active ? 'Menonaktifkan modul…' : 'Mengaktifkan modul…');
        router.post(`/instructor/modules/${module.id}/toggle-active`, {}, {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error('Gagal mengubah status modul.', { id: tid }),
        });
    };

    const handleDeleteEnrichment = (e: Enrichment) => {
        const tid = toast.loading('Menghapus pengayaan…');
        router.delete(`/instructor/modules/${module.id}/enrichment/${e.id}`, {
            onSuccess: () => { toast.dismiss(tid); setDeleteEnrichmentConfirm(null); },
            onError:   () => toast.error('Gagal menghapus pengayaan.', { id: tid }),
        });
    };

    const renderContent = (content: any): string[] => {
        if (Array.isArray(content)) return content;
        if (typeof content === 'string') {
            try { const p = JSON.parse(content); return Array.isArray(p) ? p : [content]; }
            catch { return [content]; }
        }
        return [];
    };

    // ─── Logika tombol: jika kosong → Tambah, jika sudah ada → Edit ───────────
    // CPMK
    const cpmkEmpty   = cpmks.length === 0;
    const cpmkItem    = cpmks[0] ?? null;

    // Tujuan Pembelajaran
    const loEmpty     = learningObjectives.length === 0;
    const loItem      = learningObjectives[0] ?? null;

    // Materi
    const matEmpty    = materials.length === 0;
    const matItem     = materials[0] ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modul: ${module.title}`} />

            <Toaster position="top-right" toastOptions={{
                style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '10px', border: '1px solid #374151' },
                success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                loading: { style: { background: '#1e3a5f', color: '#bfdbfe', border: '1px solid #3b82f6' } },
            }} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                {/* ── Header ── */}
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-gray-800 dark:to-gray-700">
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 lg:flex-row">
                        <div className="flex flex-1 items-start gap-3">
                            <Link href="/instructor/modules"
                                className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-white dark:hover:bg-gray-600">
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </Link>
                            <div className="flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{module.title}</h1>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        module.is_active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                        {module.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">{module.description}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> Dibuat: {module.created_at}
                                    </span>
                                    <span>•</span>
                                    <span>Urutan: #{module.order_number}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={handleToggleActive}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                    module.is_active
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                                }`}>
                                <Power className="h-4 w-4" />
                                {module.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <Link href={`/instructor/modules/${module.id}/edit`}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                <Edit className="h-4 w-4" /> Ubah
                            </Link>
                            <button onClick={() => setShowDeleteModule(true)}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700">
                                <Trash2 className="h-4 w-4" /> Hapus
                            </button>
                        </div>
                    </div>

                    {/* Statistik */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: 'Total Komponen',       value: statistics.total_components,     icon: <BookOpen     className="h-8 w-8 text-blue-500" /> },
                            { label: 'Total Mahasiswa',      value: statistics.total_students,       icon: <Users        className="h-8 w-8 text-green-500" /> },
                            { label: 'Sudah Selesai',        value: statistics.completed_students,   icon: <CheckCircle2 className="h-8 w-8 text-purple-500" /> },
                            { label: 'Tingkat Penyelesaian', value: `${statistics.completion_rate}%`, icon: <TrendingUp  className="h-8 w-8 text-orange-500" /> },
                        ].map(({ label, value, icon }) => (
                            <div key={label} className="rounded-lg bg-white p-4 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                                    </div>
                                    {icon}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                 * Bagian CPMK
                 * • Kosong → tombol "Tambah CPMK" muncul (create)
                 * • Sudah ada → tombol "Ubah" per item, tanpa tombol hapus
                 * ───────────────────────────────────────────────────────── */}
                <SmartSection
                    title="CPMK (Capaian Pembelajaran Mata Kuliah)"
                    icon={<Award className="h-5 w-5" />}
                    color="blue"
                    isEmpty={cpmkEmpty}
                    emptyLabel="Belum ada CPMK. Klik tombol di bawah untuk menambahkan."
                    addLabel="Tambah CPMK"
                    onAdd={() => setCpmkModal({ mode: 'create' })}
                    items={cpmks}
                    onEdit={item => setCpmkModal({ mode: 'edit', item: item as CPMK })}
                    renderItem={(item: CPMK) => (
                        <div>
                            <ul className="list-disc list-inside space-y-1">
                                {renderContent(item.content).map((line, i) => (
                                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{line}</li>
                                ))}
                            </ul>
                            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <Award className="h-3 w-3" /> {item.point_reward} poin
                            </p>
                        </div>
                    )}
                />

                {/* ─────────────────────────────────────────────────────────
                 * Bagian Tujuan Pembelajaran
                 * ───────────────────────────────────────────────────────── */}
                <SmartSection
                    title="Tujuan Pembelajaran"
                    icon={<List className="h-5 w-5" />}
                    color="yellow"
                    isEmpty={loEmpty}
                    emptyLabel="Belum ada tujuan pembelajaran. Klik tombol di bawah untuk menambahkan."
                    addLabel="Tambah Tujuan Pembelajaran"
                    onAdd={() => setLearningObjModal({ mode: 'create' })}
                    items={learningObjectives}
                    onEdit={item => setLearningObjModal({ mode: 'edit', item: item as LearningObjective })}
                    renderItem={(item: LearningObjective) => (
                        <div>
                            <ol className="list-decimal list-inside space-y-1">
                                {renderContent(item.content).map((line, i) => (
                                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{line}</li>
                                ))}
                            </ol>
                            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <Award className="h-3 w-3" /> {item.point_reward} poin
                            </p>
                        </div>
                    )}
                />

                {/* ─────────────────────────────────────────────────────────
                 * Bagian Materi PDF
                 * ───────────────────────────────────────────────────────── */}
                <SmartSection
                    title="Materi (PDF)"
                    icon={<FileText className="h-5 w-5" />}
                    color="green"
                    isEmpty={matEmpty}
                    emptyLabel="Belum ada materi. Unggah file PDF untuk mahasiswa."
                    addLabel="Unggah Materi PDF"
                    onAdd={() => setMaterialModal({ mode: 'create' })}
                    items={materials}
                    onEdit={item => setMaterialModal({ mode: 'edit', item: item as Material })}
                    renderItem={(item: Material) => (
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                            <div className="mt-2 flex items-center gap-3 text-xs">
                                <span className="text-gray-500 dark:text-gray-400">📄 {item.file_name}</span>
                                <span className="text-amber-600 dark:text-amber-400">{item.point_reward} poin</span>
                            </div>
                        </div>
                    )}
                />

                {/* ── Pengayaan (create + edit + hapus penuh) ── */}
                <FullSection
                    title="Pengayaan (Video & Tautan)"
                    icon={<Lightbulb className="h-5 w-5" />}
                    color="purple"
                    items={enrichments}
                    onAdd={() => setEnrichmentModal({ mode: 'create' })}
                    onEdit={item => setEnrichmentModal({ mode: 'edit', item: item as Enrichment })}
                    onDelete={item => setDeleteEnrichmentConfirm(item as Enrichment)}
                    renderItem={(item: Enrichment) => (
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                {item.type === 'video'
                                    ? <Video className="h-4 w-4 text-purple-600" />
                                    : <LinkIcon className="h-4 w-4 text-blue-600" />}
                                <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                    {item.type === 'video' ? 'Video' : 'Tautan'}
                                </span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 break-all text-xs text-blue-600 hover:underline">
                                {item.url} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                            <div className="mt-2 flex items-center gap-3 text-xs">
                                <span className="text-gray-500 dark:text-gray-400">Urutan: #{item.order_number}</span>
                                <span className="text-amber-600 dark:text-amber-400">{item.point_reward} poin</span>
                            </div>
                        </div>
                    )}
                />

                {/* ── Kuis & Praktikum ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <InfoCard title="Kuis"       icon={<ClipboardList className="h-5 w-5" />} color="orange" count={quizzes.length}     linkText="Kelola Kuis"      linkHref="/instructor/quiz" />
                    <InfoCard title="Praktikum"  icon={<PlayCircle    className="h-5 w-5" />} color="red"    count={assignments.length}  linkText="Kelola Praktikum" linkHref="/instructor/praktikum" />
                </div>

                {/* ── Progres Mahasiswa ── */}
                <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            Progres Mahasiswa (10 Teratas)
                        </h2>
                    </div>
                    <div className="space-y-3 p-6">
                        {studentProgress.length > 0 ? studentProgress.map(s => (
                            <div key={s.id} className="flex flex-col items-start justify-between gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700 sm:flex-row sm:items-center">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-gray-900 dark:text-white">{s.name}</p>
                                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">{s.email}</p>
                                </div>
                                <div className="flex w-full items-center gap-3 sm:w-auto">
                                    <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-600 sm:w-32">
                                        <div className="h-2 rounded-full bg-green-500 transition-all duration-300" style={{ width: `${s.progress_percentage}%` }} />
                                    </div>
                                    <span className="w-12 flex-shrink-0 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                        {s.progress_percentage}%
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="py-8 text-center text-gray-500 dark:text-gray-400">Belum ada data mahasiswa.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ════ Modal CPMK (create / edit) ════ */}
            {cpmkModal && (
                <CpmkModal
                    module={module}
                    mode={cpmkModal.mode}
                    cpmk={cpmkModal.item ?? null}
                    onClose={() => setCpmkModal(null)}
                />
            )}

            {/* ════ Modal Tujuan Pembelajaran (create / edit) ════ */}
            {learningObjModal && (
                <LearningObjectiveModal
                    module={module}
                    mode={learningObjModal.mode}
                    objective={learningObjModal.item ?? null}
                    onClose={() => setLearningObjModal(null)}
                />
            )}

            {/* ════ Modal Materi (create / edit) ════ */}
            {materialModal && (
                <MaterialModal
                    module={module}
                    mode={materialModal.mode}
                    material={materialModal.item ?? null}
                    onClose={() => setMaterialModal(null)}
                />
            )}

            {/* ════ Modal Pengayaan (create / edit) ════ */}
            {enrichmentModal && (
                <EnrichmentModal
                    module={module}
                    enrichment={enrichmentModal.mode === 'edit' ? (enrichmentModal.item ?? null) : null}
                    onClose={() => setEnrichmentModal(null)}
                />
            )}

            {/* ════ Modal Konfirmasi Hapus Pengayaan ════ */}
            {deleteEnrichmentConfirm && (
                <ConfirmDeleteModal
                    title="Hapus Pengayaan"
                    message={`Hapus pengayaan "${deleteEnrichmentConfirm.title}"? Tindakan ini tidak dapat dibatalkan.`}
                    onConfirm={() => handleDeleteEnrichment(deleteEnrichmentConfirm)}
                    onCancel={() => setDeleteEnrichmentConfirm(null)}
                />
            )}

            {/* ════ Modal Konfirmasi Hapus Modul ════ */}
            {showDeleteModule && (
                <ConfirmDeleteModal
                    title="Hapus Modul"
                    message={`Hapus modul "${module.title}"? Semua konten terkait akan ikut terhapus dan tindakan ini tidak dapat dibatalkan.`}
                    onConfirm={handleDeleteModule}
                    onCancel={() => setShowDeleteModule(false)}
                    danger
                />
            )}
        </AppLayout>
    );
}

// ─────────────────────────────────────────────
// SmartSection: kosong → Tambah, ada isi → Edit saja
// ─────────────────────────────────────────────

interface SmartSectionProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    isEmpty: boolean;
    emptyLabel: string;
    addLabel: string;
    onAdd: () => void;
    items: any[];
    onEdit: (item: any) => void;
    renderItem: (item: any) => React.ReactNode;
}

function SmartSection({ title, icon, color, isEmpty, emptyLabel, addLabel, onAdd, items, onEdit, renderItem }: SmartSectionProps) {
    const colorMap: Record<string, string> = {
        blue:   'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
        yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30',
        green:  'text-green-600 bg-green-50 dark:bg-green-900/30',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center">
                <h3 className="flex flex-wrap items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <div className={`rounded-lg p-2 ${colorMap[color] ?? colorMap.blue}`}>{icon}</div>
                    <span>{title}</span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700">{items.length}</span>
                </h3>
                {/* Tampilkan tombol Tambah HANYA jika kosong */}
                {isEmpty && (
                    <button onClick={onAdd}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 sm:w-auto">
                        <Plus className="h-4 w-4" /> {addLabel}
                    </button>
                )}
            </div>

            <div className="p-4">
                {isEmpty ? (
                    /* ── Kosong: ilustrasi + tombol tambah ── */
                    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
                        <div className={`rounded-xl p-3 ${colorMap[color] ?? colorMap.blue}`}>{icon}</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</p>
                        <button onClick={onAdd}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> {addLabel}
                        </button>
                    </div>
                ) : (
                    /* ── Ada isi: hanya tombol Edit per baris ── */
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={item.id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                                                {idx + 1}
                                            </span>
                                        </div>
                                        {renderItem(item)}
                                    </div>
                                    <button onClick={() => onEdit(item)}
                                        className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                                        title="Ubah">
                                        <Edit className="h-4 w-4 text-blue-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// FullSection: create + edit + hapus (Pengayaan)
// ─────────────────────────────────────────────

interface FullSectionProps {
    title: string; icon: React.ReactNode; color: string; items: any[];
    onAdd: () => void; onEdit: (item: any) => void; onDelete: (item: any) => void;
    renderItem: (item: any) => React.ReactNode;
}

function FullSection({ title, icon, color, items, onAdd, onEdit, onDelete, renderItem }: FullSectionProps) {
    const colorMap: Record<string, string> = {
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
    };
    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center">
                <h3 className="flex flex-wrap items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <div className={`rounded-lg p-2 ${colorMap[color] ?? ''}`}>{icon}</div>
                    <span>{title}</span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700">{items.length}</span>
                </h3>
                <button onClick={onAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 sm:w-auto">
                    <Plus className="h-4 w-4" /> Tambah
                </button>
            </div>
            <div className="p-4">
                {items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada item. Klik "Tambah" untuk membuat baru.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={item.id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                                                {idx + 1}
                                            </span>
                                        </div>
                                        {renderItem(item)}
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-1">
                                        <button onClick={() => onEdit(item)} className="rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600" title="Ubah">
                                            <Edit className="h-4 w-4 text-blue-600" />
                                        </button>
                                        <button onClick={() => onDelete(item)} className="rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600" title="Hapus">
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// InfoCard
// ─────────────────────────────────────────────

function InfoCard({ title, icon, color, count, linkText, linkHref }: any) {
    const colorMap: Record<string, string> = {
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
        red:    'text-red-600 bg-red-50 dark:bg-red-900/30',
    };
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg p-3 ${colorMap[color] ?? ''}`}>{icon}</div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
            </div>
            <Link href={linkHref}
                className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-center text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                {linkText}
            </Link>
        </div>
    );
}

// ─────────────────────────────────────────────
// Modal Konfirmasi Hapus
// ─────────────────────────────────────────────

function ConfirmDeleteModal({ title, message, onConfirm, onCancel, danger = false }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                </div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
                {danger && (
                    <p className="mb-4 text-xs text-red-600 dark:text-red-400">
                        ⚠ Tindakan ini tidak dapat dibatalkan.
                    </p>
                )}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button onClick={onCancel}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                        Batal
                    </button>
                    <button onClick={onConfirm}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Komponen Pembantu Modal
// ─────────────────────────────────────────────

function ModalShell({ title, onClose, wide = false, children }: {
    title: string; onClose: () => void; wide?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
            <div className={`my-8 w-full rounded-2xl bg-white shadow-2xl dark:bg-gray-800 ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[calc(90vh-130px)] overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

function PointRewardField({ value, onChange, error }: { value: number; onChange: (v: number) => void; error?: string }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Poin Hadiah <span className="text-red-500">*</span>
            </label>
            <input type="number" value={value} min="0"
                onChange={e => onChange(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function ModalFooter({ onCancel, processing, labelSave }: { onCancel: () => void; processing: boolean; labelSave: string }) {
    return (
        <div className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button type="button" onClick={onCancel}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Batal
            </button>
            <button type="submit" disabled={processing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400">
                <Save className="h-4 w-4" />
                {processing ? 'Menyimpan…' : labelSave}
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────
// Modal CPMK (create / edit)
// ─────────────────────────────────────────────

interface CpmkModalProps { module: Module; mode: 'create' | 'edit'; cpmk: CPMK | null; onClose: () => void; }

function CpmkModal({ module, mode, cpmk, onClose }: CpmkModalProps) {
    const initialItems = cpmk
        ? (Array.isArray(cpmk.content) ? cpmk.content : [cpmk.content])
        : [''];
    const [items, setItems] = useState<string[]>(initialItems);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        content:      initialItems,
        point_reward: cpmk?.point_reward ?? 10,
    });

    const sync  = (next: string[]) => { setItems(next); setData('content', next); };
    const upd   = (i: number, v: string) => { const n = [...items]; n[i] = v; sync(n); };
    const add   = () => sync([...items, '']);
    const rem   = (i: number) => { if (items.length > 1) sync(items.filter((_, x) => x !== i)); };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (items.every(s => !s.trim())) { toast.error('Isi CPMK tidak boleh kosong.'); return; }
        const url    = mode === 'create'
            ? `/instructor/modules/${module.id}/cpmk`
            : `/instructor/modules/${module.id}/cpmk/${cpmk!.id}`;
        const method = mode === 'create' ? post : put;
        method(url, { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <ModalShell title={mode === 'create' ? 'Tambah CPMK' : 'Ubah CPMK'} onClose={onClose}>
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Isi CPMK <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                        {items.map((item, i) => (
                            <div key={i} className="flex gap-2">
                                <textarea value={item} rows={2}
                                    onChange={e => upd(i, e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder={`Butir CPMK ${i + 1}…`} />
                                {items.length > 1 && (
                                    <button type="button" onClick={() => rem(i)}
                                        className="self-start rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={add}
                        className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        <Plus className="h-4 w-4" /> Tambah butir
                    </button>
                    {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
                </div>
                <PointRewardField value={data.point_reward} onChange={v => setData('point_reward', v)} error={errors.point_reward} />
                <ModalFooter onCancel={onClose} processing={processing} labelSave={mode === 'create' ? 'Simpan CPMK' : 'Simpan Perubahan'} />
            </form>
        </ModalShell>
    );
}

// ─────────────────────────────────────────────
// Modal Tujuan Pembelajaran (create / edit)
// ─────────────────────────────────────────────

interface LearningObjectiveModalProps { module: Module; mode: 'create' | 'edit'; objective: LearningObjective | null; onClose: () => void; }

function LearningObjectiveModal({ module, mode, objective, onClose }: LearningObjectiveModalProps) {
    const initialItems = objective
        ? (Array.isArray(objective.content) ? objective.content : [objective.content])
        : [''];
    const [items, setItems] = useState<string[]>(initialItems);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        content:      initialItems,
        point_reward: objective?.point_reward ?? 10,
    });

    const sync = (next: string[]) => { setItems(next); setData('content', next); };
    const upd  = (i: number, v: string) => { const n = [...items]; n[i] = v; sync(n); };
    const add  = () => sync([...items, '']);
    const rem  = (i: number) => { if (items.length > 1) sync(items.filter((_, x) => x !== i)); };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (items.every(s => !s.trim())) { toast.error('Tujuan pembelajaran tidak boleh kosong.'); return; }
        const url    = mode === 'create'
            ? `/instructor/modules/${module.id}/learning-objective`
            : `/instructor/modules/${module.id}/learning-objective/${objective!.id}`;
        const method = mode === 'create' ? post : put;
        method(url, { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <ModalShell title={mode === 'create' ? 'Tambah Tujuan Pembelajaran' : 'Ubah Tujuan Pembelajaran'} onClose={onClose}>
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tujuan Pembelajaran <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                        {items.map((item, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="mt-2.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold dark:bg-gray-700 dark:text-gray-300">
                                    {i + 1}
                                </span>
                                <textarea value={item} rows={2}
                                    onChange={e => upd(i, e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder={`Tujuan ${i + 1}…`} />
                                {items.length > 1 && (
                                    <button type="button" onClick={() => rem(i)}
                                        className="self-start rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={add}
                        className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        <Plus className="h-4 w-4" /> Tambah tujuan
                    </button>
                    {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
                </div>
                <PointRewardField value={data.point_reward} onChange={v => setData('point_reward', v)} error={errors.point_reward} />
                <ModalFooter onCancel={onClose} processing={processing} labelSave={mode === 'create' ? 'Simpan Tujuan' : 'Simpan Perubahan'} />
            </form>
        </ModalShell>
    );
}

// ─────────────────────────────────────────────
// Modal Materi (create / edit + pratinjau PDF)
// ─────────────────────────────────────────────

interface MaterialModalProps { module: Module; mode: 'create' | 'edit'; material: Material | null; onClose: () => void; }

function MaterialModal({ module, mode, material, onClose }: MaterialModalProps) {
    const isEditing = mode === 'edit' && !!material;
    const [selectedFile,   setSelectedFile]   = useState<File | null>(null);
    const [showPdfPreview, setShowPdfPreview]  = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title:        material?.title        || '',
        description:  material?.description  || '',
        file:         null as File | null,
        point_reward: material?.point_reward ?? 50,
        _method:      isEditing ? 'PUT' : 'POST',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { toast.error('Hanya file PDF yang diperbolehkan.'); return; }
        if (file.size > 20 * 1024 * 1024)    { toast.error('Ukuran file tidak boleh melebihi 20 MB.'); return; }
        setSelectedFile(file);
        setData('file', file);
        setShowPdfPreview(false);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.title.trim())        { toast.error('Judul materi tidak boleh kosong.'); return; }
        if (!isEditing && !selectedFile) { toast.error('Pilih file PDF terlebih dahulu.'); return; }

        const url = isEditing
            ? `/instructor/modules/${module.id}/material/${material!.id}`
            : `/instructor/modules/${module.id}/material`;

        post(url, {
            forceFormData: true,
            onSuccess: () => { reset(); setSelectedFile(null); onClose(); },
        });
    };

    return (
        <ModalShell title={isEditing ? 'Ubah Materi' : 'Unggah Materi'} onClose={onClose} wide>
            <form onSubmit={submit} className="space-y-5">
                {/* Judul */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Judul <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Judul materi…" />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                </div>

                {/* Deskripsi */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                    <textarea value={data.description} rows={3}
                        onChange={e => setData('description', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Deskripsi singkat materi…" />
                </div>

                {/* Pratinjau file yang sudah ada (mode edit saja) */}
                {isEditing && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">File saat ini:</span>
                                <span className="max-w-[200px] truncate text-sm text-gray-500 dark:text-gray-400">{material!.file_name}</span>
                            </div>
                            <button type="button"
                                onClick={() => setShowPdfPreview(v => !v)}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
                                <Eye className="h-3.5 w-3.5" />
                                {showPdfPreview ? 'Sembunyikan' : 'Pratinjau'}
                            </button>
                        </div>
                        {showPdfPreview ? (
                            <div className="h-96 w-full overflow-hidden rounded-b-xl bg-gray-100 dark:bg-gray-900">
                                <iframe src={`/storage/${material!.file_path}`} className="h-full w-full" title="Pratinjau PDF" />
                            </div>
                        ) : (
                            <p className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                                Klik "Pratinjau" untuk melihat isi file PDF saat ini.
                            </p>
                        )}
                    </div>
                )}

                {/* Unggah / Ganti File */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isEditing ? 'Ganti File PDF' : 'File PDF'} {!isEditing && <span className="text-red-500">*</span>}
                        {isEditing && <span className="ml-2 text-xs text-gray-400">(Kosongkan jika tidak ingin mengganti)</span>}
                    </label>
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                        <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                            {selectedFile
                                ? <><span className="font-medium text-blue-600">{selectedFile.name}</span> dipilih</>
                                : 'Pilih file PDF (maks. 20 MB)'}
                        </p>
                        {selectedFile && (
                            <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">⚠ File lama akan digantikan setelah disimpan.</p>
                        )}
                        <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="mat-file-upload" />
                        <label htmlFor="mat-file-upload"
                            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                            Pilih File
                        </label>
                    </div>
                    {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file}</p>}
                </div>

                <PointRewardField value={data.point_reward} onChange={v => setData('point_reward', v)} error={errors.point_reward} />
                <ModalFooter onCancel={onClose} processing={processing}
                    labelSave={isEditing ? 'Simpan Perubahan' : 'Unggah Materi'} />
            </form>
        </ModalShell>
    );
}

// ─────────────────────────────────────────────
// Modal Pengayaan (create / edit)
// ─────────────────────────────────────────────

interface EnrichmentModalProps { module: Module; enrichment: Enrichment | null; onClose: () => void; }

function EnrichmentModal({ module, enrichment, onClose }: EnrichmentModalProps) {
    const isEditing = !!enrichment;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title:        enrichment?.title        || '',
        description:  enrichment?.description  || '',
        type:         enrichment?.type         || 'video' as 'video' | 'link',
        url:          enrichment?.url          || '',
        order_number: enrichment?.order_number || 1,
        point_reward: enrichment?.point_reward || 10,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.title.trim()) { toast.error('Judul pengayaan tidak boleh kosong.'); return; }
        if (!data.url.trim())   { toast.error('URL pengayaan tidak boleh kosong.');   return; }
        const url    = isEditing
            ? `/instructor/modules/${module.id}/enrichment/${enrichment!.id}`
            : `/instructor/modules/${module.id}/enrichment`;
        const method = isEditing ? put : post;
        method(url, { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <ModalShell title={isEditing ? 'Ubah Pengayaan' : 'Tambah Pengayaan'} onClose={onClose}>
            <form onSubmit={submit} className="space-y-5">
                {/* Jenis */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis <span className="text-red-500">*</span></label>
                    <div className="flex gap-4">
                        {(['video', 'link'] as const).map(t => (
                            <label key={t} className="flex cursor-pointer items-center gap-2">
                                <input type="radio" value={t} checked={data.type === t} onChange={() => setData('type', t)} className="h-4 w-4 text-blue-600" />
                                {t === 'video' ? <Video className="h-4 w-4 text-purple-600" /> : <LinkIcon className="h-4 w-4 text-blue-600" />}
                                <span className="text-sm text-gray-700 dark:text-gray-300">{t === 'video' ? 'Video' : 'Tautan'}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Judul */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Judul <span className="text-red-500">*</span></label>
                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Judul pengayaan…" />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                </div>
                {/* Deskripsi */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                    <textarea value={data.description} rows={2} onChange={e => setData('description', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Deskripsi singkat…" />
                </div>
                {/* URL */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">URL <span className="text-red-500">*</span></label>
                    <input type="url" value={data.url} onChange={e => setData('url', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="https://…" />
                    {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url}</p>}
                </div>
                {/* Nomor Urut & Poin */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Urut <span className="text-red-500">*</span></label>
                        <input type="number" value={data.order_number} min="1"
                            onChange={e => setData('order_number', parseInt(e.target.value) || 1)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <PointRewardField value={data.point_reward} onChange={v => setData('point_reward', v)} error={errors.point_reward} />
                </div>
                <ModalFooter onCancel={onClose} processing={processing}
                    labelSave={isEditing ? 'Simpan Perubahan' : 'Tambah Pengayaan'} />
            </form>
        </ModalShell>
    );
}
