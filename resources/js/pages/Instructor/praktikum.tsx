/**
 * resources/js/pages/Instructor/praktikum.tsx
 *
 * Desain konsisten dengan halaman Kuis (index.tsx):
 * - Layout, warna, ukuran font, kartu, tab, dan modal mengikuti pola Kuis.
 * - Aturan is_active: tepat 1 aktif per modul, guard di frontend & backend.
 * - Konfirmasi modal sebelum toggle aktif/nonaktif dan hapus.
 * - Tombol unduh template laporan di header.
 * - Input daftar tugas (tasks) dinamis: tambah, hapus, dan ubah urutan.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Upload, Plus, Edit3, Trash2, Eye, Search, Download,
    Calendar, FileText, Star, BarChart3, X, Save,
    AlertTriangle, ArrowLeft, Users, CheckCircle, Clock,
    Award, Power, PowerOff, BookOpen, GripVertical, ListTodo,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Tipe Data
// ─────────────────────────────────────────────

interface ClassDeadline { classId: number; className: string; deadline: string; }

interface Assignment {
    id: number;
    title: string;
    moduleId: number;
    moduleName: string;
    description: string;
    tasks: string[];
    deadline: string;
    classDeadlines: ClassDeadline[];
    maxScore: number;
    submissions: number;
    totalStudents: number;
    averageScore: number;
    status: 'active' | 'draft';
    createdAt: string;
    pointRewardEarly?: number;
    pointRewardOntime?: number;
    pointRewardLate?: number;
}

interface Module    { id: number; title: string; order: number; }
interface ClassRoom { id: number; name: string; }

interface Submission {
    id: number;
    assignmentId: number;
    assignmentTitle: string;
    studentId: number;
    studentName: string;
    nim: string;
    fileName: string;
    fileSize: string;
    submittedAt: string;
    status: 'graded' | 'submitted';
    score: number | null;
    feedback: string;
    isLate: boolean;
    daysLate: number;
    daysEarly: number;
}

interface AssignmentFormData {
    title: string;
    module_id: string;
    description: string;
    instructions: string;
    tasks: string[];
    deadline: string;
    class_deadlines: { class_id: string; deadline: string }[];
    max_score: number;
    point_reward_early: number;
    point_reward_ontime: number;
    point_reward_late: number;
    is_active: boolean;
}

// ─────────────────────────────────────────────
// Modal Konfirmasi Toggle
// ─────────────────────────────────────────────

interface ConfirmToggleProps {
    assignment: Assignment;
    activeTitle: string | null;
    mode: 'activate' | 'deactivate';
    hasDraft: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}
function ConfirmToggleModal({ assignment, activeTitle, mode, hasDraft, onConfirm, onCancel }: ConfirmToggleProps) {
    const isActivate = mode === 'activate';
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 rounded-xl p-2 ${isActivate ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        <AlertTriangle className={`h-5 w-5 ${isActivate ? 'text-emerald-600' : 'text-amber-600'}`} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {isActivate ? 'Aktifkan Praktikum?' : 'Nonaktifkan Praktikum?'}
                    </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {isActivate ? (
                        <>
                            <p>Praktikum <strong className="text-gray-900 dark:text-white">"{assignment.title}"</strong> akan diaktifkan dan dapat dikerjakan mahasiswa.</p>
                            {activeTitle && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
                                    <p className="text-amber-800 dark:text-amber-300">
                                        ⚠ Praktikum <strong>"{activeTitle}"</strong> yang sedang aktif akan otomatis dijadikan <strong>draf</strong>.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p>Praktikum <strong className="text-gray-900 dark:text-white">"{assignment.title}"</strong> akan dijadikan draf.</p>
                            {hasDraft ? (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
                                    <p className="text-blue-800 dark:text-blue-300">
                                        ℹ Praktikum draf lain di modul ini akan otomatis diaktifkan sebagai pengganti.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20">
                                    <p className="text-red-800 dark:text-red-300">
                                        ✗ Tidak ada draf lain di modul ini. Tidak dapat dinonaktifkan.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onCancel} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                        Batal
                    </button>
                    <button onClick={onConfirm} disabled={!isActivate && !hasDraft}
                        className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            isActivate ? 'bg-emerald-600 text-white hover:bg-emerald-500' : hasDraft ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-gray-300 text-gray-500'
                        }`}>
                        {isActivate ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Modal Konfirmasi Hapus
// ─────────────────────────────────────────────

interface ConfirmDeleteProps {
    assignment: Assignment;
    blockedReason: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}
function ConfirmDeleteModal({ assignment, blockedReason, onConfirm, onCancel }: ConfirmDeleteProps) {
    const blocked = blockedReason !== null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 rounded-xl p-2 ${blocked ? 'bg-gray-100 dark:bg-gray-700' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <Trash2 className={`h-5 w-5 ${blocked ? 'text-gray-500' : 'text-red-600'}`} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {blocked ? 'Tidak Dapat Dihapus' : 'Hapus Praktikum?'}
                    </h3>
                </div>
                {blocked ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20">
                        <p className="text-sm text-red-800 dark:text-red-300">{blockedReason}</p>
                    </div>
                ) : (
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>Hapus praktikum <strong className="text-gray-900 dark:text-white">"{assignment.title}"</strong>?</p>
                        <div className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20">
                            <p className="font-medium text-red-800 dark:text-red-300">⚠ Perhatian:</p>
                            <ul className="list-inside list-disc space-y-0.5 text-xs text-red-700 dark:text-red-400">
                                <li>Semua data pengumpulan mahasiswa akan ikut terhapus.</li>
                                <li>Tindakan ini tidak dapat dibatalkan.</li>
                                {assignment.status === 'active' && <li>Praktikum draf lain di modul ini akan otomatis diaktifkan.</li>}
                            </ul>
                        </div>
                    </div>
                )}
                <div className="flex gap-3 pt-1">
                    <button onClick={onCancel} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                        {blocked ? 'Tutup' : 'Batal'}
                    </button>
                    {!blocked && (
                        <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500">
                            Ya, Hapus
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Sub-komponen: Editor Daftar Tugas
// ─────────────────────────────────────────────

interface TasksEditorProps {
    tasks: string[];
    onChange: (tasks: string[]) => void;
    error?: string;
}

function TasksEditor({ tasks, onChange, error }: TasksEditorProps) {
    const tambahTugas = () => {
        onChange([...tasks, '']);
    };

    const ubahTugas = (index: number, nilai: string) => {
        const baru = [...tasks];
        baru[index] = nilai;
        onChange(baru);
    };

    const hapusTugas = (index: number) => {
        onChange(tasks.filter((_, i) => i !== index));
    };

    const pindahTugas = (dari: number, ke: number) => {
        if (ke < 0 || ke >= tasks.length) return;
        const baru = [...tasks];
        const [dipindah] = baru.splice(dari, 1);
        baru.splice(ke, 0, dipindah);
        onChange(baru);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Daftar Tugas <span className="text-gray-400">(Opsional)</span>
                    </label>
                </div>
                <span className="text-xs text-gray-400">{tasks.length} tugas</span>
            </div>
            <p className="mb-3 text-xs text-gray-400">
                Tugas ini akan ditampilkan kepada mahasiswa sebagai panduan pengerjaan praktikum.
            </p>

            {/* Daftar Tugas */}
            <div className="space-y-2">
                {tasks.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
                        <ListTodo className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                        <p className="text-xs text-gray-400">Belum ada tugas. Klik tombol di bawah untuk menambahkan.</p>
                    </div>
                )}

                {tasks.map((tugas, i) => (
                    <div key={i} className="flex items-start gap-2">
                        {/* Nomor & Tombol Pindah */}
                        <div className="flex flex-shrink-0 flex-col items-center gap-0.5 pt-2.5">
                            <button
                                type="button"
                                onClick={() => pindahTugas(i, i - 1)}
                                disabled={i === 0}
                                title="Pindah ke atas"
                                className="rounded p-0.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700"
                            >
                                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                                    <path d="M6 2l4 5H2z" />
                                </svg>
                            </button>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                {i + 1}
                            </span>
                            <button
                                type="button"
                                onClick={() => pindahTugas(i, i + 1)}
                                disabled={i === tasks.length - 1}
                                title="Pindah ke bawah"
                                className="rounded p-0.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700"
                            >
                                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                                    <path d="M6 10L2 5h8z" />
                                </svg>
                            </button>
                        </div>

                        {/* Input Tugas */}
                        <textarea
                            rows={2}
                            value={tugas}
                            onChange={e => ubahTugas(i, e.target.value)}
                            placeholder={`Contoh: Buat program Hello World menggunakan bahasa C++, lalu dokumentasikan langkahnya.`}
                            className="flex-1 resize-none rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />

                        {/* Tombol Hapus */}
                        <button
                            type="button"
                            onClick={() => hapusTugas(i)}
                            title="Hapus tugas ini"
                            className="mt-2 flex-shrink-0 rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Tombol Tambah Tugas */}
            <button
                type="button"
                onClick={tambahTugas}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 py-2 text-sm text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
                <Plus className="h-4 w-4" />
                Tambah Tugas
            </button>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

// ─────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/instructor/dashboard' },
    { title: 'Manajemen Praktikum', href: '/instructor/praktikum' },
];

// ─────────────────────────────────────────────
// Komponen Utama
// ─────────────────────────────────────────────

export default function InstructorPraktikumManagement({
    assignments = [],
    modules = [],
    classes = [],
    templateExists = false,
}: {
    assignments?: Assignment[];
    modules?: Module[];
    classes?: ClassRoom[];
    templateExists?: boolean;
}) {
    const { props } = usePage<any>();

    // Flash message dari server
    useEffect(() => {
        const flash = props.flash as { success?: string; error?: string } | undefined;
        if (flash?.success) toast.success(flash.success, { duration: 5000 });
        if (flash?.error)   toast.error(flash.error,   { duration: 6000 });
    }, [props.flash]);

    // ── State ──
    const [activeTab, setActiveTab]               = useState<'assignments' | 'analytics'>('assignments');
    const [searchTerm, setSearchTerm]             = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [modalMode, setModalMode]               = useState<'create' | 'edit' | null>(null);
    const [selectedItem, setSelectedItem]         = useState<Assignment | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [submissions, setSubmissions]           = useState<Submission[]>([]);
    const [analytics, setAnalytics]               = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [subLoading, setSubLoading]             = useState(false);
    const [pdfPreview, setPdfPreview]             = useState<{ url: string; sub: Submission } | null>(null);
    // State lokal daftar tugas (dikelola terpisah agar lebih mudah dimanipulasi)
    const [formTasks, setFormTasks]               = useState<string[]>([]);

    // Konfirmasi toggle & hapus
    const [toggleConfirm, setToggleConfirm] = useState<{
        assignment: Assignment;
        mode: 'activate' | 'deactivate';
        activeTitle: string | null;
        hasDraft: boolean;
    } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        assignment: Assignment;
        blockedReason: string | null;
    } | null>(null);

    // ── Form ──
    const assignmentForm = useForm<AssignmentFormData>({
        title: '',
        module_id: '',
        description: '',
        instructions: '',
        tasks: [],
        deadline: '',
        class_deadlines: (classes ?? []).map(c => ({ class_id: String(c.id), deadline: '' })),
        max_score: 100,
        point_reward_early: 10,
        point_reward_ontime: 5,
        point_reward_late: 2,
        is_active: false,
    });

    const gradeForm = useForm({ score: '', feedback: '' });
    const [showGradeModal, setShowGradeModal] = useState(false);

    // Sinkronkan formTasks → assignmentForm.data.tasks sebelum submit
    const syncTasksToForm = useCallback(() => {
        assignmentForm.setData('tasks', formTasks.filter(t => t.trim() !== ''));
    }, [formTasks, assignmentForm]);

    // ── Hitung aktif & draf per modul ──
    const activeByModule = useMemo(() => {
        const m: Record<number, number> = {};
        assignments.forEach(a => { if (a.status === 'active') m[a.moduleId] = (m[a.moduleId] ?? 0) + 1; });
        return m;
    }, [assignments]);

    const draftByModule = useMemo(() => {
        const m: Record<number, number> = {};
        assignments.forEach(a => { if (a.status === 'draft') m[a.moduleId] = (m[a.moduleId] ?? 0) + 1; });
        return m;
    }, [assignments]);

    // ── Filter & grup ──
    const filtered = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return assignments.filter(a =>
            a.title?.toLowerCase().includes(q) ||
            a.moduleName?.toLowerCase().includes(q),
        );
    }, [assignments, searchTerm]);

    const byModule = useMemo(() =>
        modules
            .map(m => ({ module: m, list: filtered.filter(a => a.moduleId === m.id) }))
            .filter(g => g.list.length > 0),
        [modules, filtered]);

    // ── Fetch Pengumpulan ──
    const loadSubmissions = useCallback(async (id: number) => {
        setSubLoading(true);
        setSubmissions([]);
        try {
            const r = await fetch(`/instructor/praktikum/submissions?assignment_id=${id}`, { credentials: 'include' });
            setSubmissions(await r.json());
        } catch { toast.error('Gagal memuat data pengumpulan.'); }
        finally { setSubLoading(false); }
    }, []);

    // ── Fetch Analitik ──
    useEffect(() => {
        if (activeTab !== 'analytics') return;
        if (analytics) return;
        setAnalyticsLoading(true);
        fetch('/instructor/praktikum/analytics', { credentials: 'include' })
            .then(r => r.json())
            .then(d => { setAnalytics(d); setAnalyticsLoading(false); })
            .catch(() => { toast.error('Gagal memuat data analitik.'); setAnalyticsLoading(false); });
    }, [activeTab, analytics]);

    // ── Buka Detail Praktikum ──
    const openDetail = (a: Assignment) => {
        setSelectedAssignment(a);
        loadSubmissions(a.id);
    };

    // ── Buat Praktikum Baru ──
    const openCreate = () => {
        assignmentForm.reset();
        assignmentForm.setData('class_deadlines', (classes ?? []).map(c => ({ class_id: String(c.id), deadline: '' })));
        setFormTasks([]);
        setSelectedItem(null);
        setModalMode('create');
    };

    // ── Edit Praktikum ──
    const openEdit = (a: Assignment) => {
        setSelectedItem(a);
        const tasks = Array.isArray(a.tasks) ? a.tasks : [];
        setFormTasks(tasks);
        assignmentForm.setData({
            title: a.title, module_id: String(a.moduleId), description: a.description,
            instructions: '', tasks, deadline: a.deadline ?? '',
            class_deadlines: (classes ?? []).map(c => {
                const ex = a.classDeadlines?.find(cd => cd.classId === c.id);
                return { class_id: String(c.id), deadline: ex?.deadline ?? '' };
            }),
            max_score: a.maxScore,
            point_reward_early: a.pointRewardEarly ?? 10,
            point_reward_ontime: a.pointRewardOntime ?? 5,
            point_reward_late: a.pointRewardLate ?? 2,
            is_active: a.status === 'active',
        });
        setModalMode('edit');
    };

    const doSave = () => {
        // Sinkronkan tasks ke form sebelum submit
        const tasksBersih = formTasks.filter(t => t.trim() !== '');
        assignmentForm.setData('tasks', tasksBersih);

        // Gunakan callback agar setData selesai lebih dulu
        setTimeout(() => {
            if (modalMode === 'create') {
                const tid = toast.loading('Membuat praktikum…');
                assignmentForm.post('/instructor/praktikum', {
                    onSuccess: () => { setModalMode(null); assignmentForm.reset(); setFormTasks([]); toast.dismiss(tid); },
                    onError:   () => toast.error('Gagal membuat praktikum.', { id: tid }),
                });
            } else if (selectedItem) {
                const tid = toast.loading('Menyimpan perubahan…');
                assignmentForm.put(`/instructor/praktikum/${selectedItem.id}`, {
                    onSuccess: () => { setModalMode(null); assignmentForm.reset(); setFormTasks([]); toast.dismiss(tid); },
                    onError:   () => toast.error('Gagal menyimpan perubahan.', { id: tid }),
                });
            }
        }, 0);
    };

    // ── Toggle Status ──
    const handleToggleClick = (a: Assignment) => {
        const moduleList = assignments.filter(x => x.moduleId === a.moduleId);
        if (a.status === 'draft') {
            const currentActive = moduleList.find(x => x.status === 'active' && x.id !== a.id);
            setToggleConfirm({ assignment: a, mode: 'activate', activeTitle: currentActive?.title ?? null, hasDraft: true });
        } else {
            const otherDrafts = moduleList.filter(x => x.status === 'draft' && x.id !== a.id);
            setToggleConfirm({ assignment: a, mode: 'deactivate', activeTitle: null, hasDraft: otherDrafts.length > 0 });
        }
    };

    const executeToggle = () => {
        if (!toggleConfirm) return;
        const { assignment } = toggleConfirm;
        setToggleConfirm(null);
        const newActive = assignment.status !== 'active';
        const tid = toast.loading(newActive ? 'Mengaktifkan…' : 'Menonaktifkan…');
        router.put(`/instructor/praktikum/${assignment.id}`, {
            title: assignment.title, module_id: assignment.moduleId, description: assignment.description,
            tasks: assignment.tasks ?? [],
            is_active: newActive, max_score: assignment.maxScore,
            point_reward_early: assignment.pointRewardEarly ?? 10,
            point_reward_ontime: assignment.pointRewardOntime ?? 5,
            point_reward_late: assignment.pointRewardLate ?? 2,
            class_deadlines: assignment.classDeadlines.map(cd => ({ class_id: String(cd.classId), deadline: cd.deadline })),
            instructions: '', deadline: assignment.deadline ?? '',
        }, {
            onSuccess: () => toast.dismiss(tid),
            onError:   () => toast.error('Gagal mengubah status.', { id: tid }),
        });
    };

    // ── Hapus Praktikum ──
    const handleDeleteClick = (a: Assignment) => {
        const otherDrafts = assignments.filter(x => x.moduleId === a.moduleId && x.status === 'draft' && x.id !== a.id);
        let blockedReason: string | null = null;
        if (a.status === 'active' && otherDrafts.length === 0 && assignments.filter(x => x.moduleId === a.moduleId && x.id !== a.id).length === 0) {
            blockedReason = 'Tidak dapat menghapus satu-satunya praktikum di modul ini.';
        }
        setDeleteConfirm({ assignment: a, blockedReason });
    };

    const executeDelete = () => {
        if (!deleteConfirm) return;
        const { assignment } = deleteConfirm;
        setDeleteConfirm(null);
        const tid = toast.loading('Menghapus praktikum…');
        router.delete(`/instructor/praktikum/${assignment.id}`, {
            onSuccess: () => toast.success(`Praktikum "${assignment.title}" berhasil dihapus.`, { id: tid }),
            onError:   () => toast.error('Gagal menghapus praktikum.', { id: tid }),
        });
    };

    // ── Beri Nilai ──
    const openGrade = (s: Submission) => {
        setSelectedSubmission(s);
        gradeForm.setData({ score: s.score?.toString() ?? '', feedback: s.feedback ?? '' });
        setShowGradeModal(true);
    };

    const doGrade = () => {
        if (!selectedSubmission) return;
        const score = parseInt(gradeForm.data.score);
        const tid = toast.loading('Menyimpan nilai…');
        gradeForm.post(`/instructor/praktikum/submissions/${selectedSubmission.id}/grade`, {
            onSuccess: () => {
                setShowGradeModal(false); gradeForm.reset();
                toast.success(`Nilai ${selectedSubmission.studentName}: ${score}/100 ⭐`, { id: tid });
                if (selectedAssignment) loadSubmissions(selectedAssignment.id);
            },
            onError: () => toast.error('Gagal menyimpan nilai.', { id: tid }),
        });
    };

    const fmtDeadline = (d: string) => {
        const diff = new Date(d).getTime() - Date.now();
        const days = Math.ceil(diff / 86_400_000);
        if (days > 0) return `${days} hari lagi`;
        if (days === 0) return 'Hari ini';
        return `Terlambat ${Math.abs(days)} hari`;
    };

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster position="top-right" toastOptions={{
                style:   { background: '#1f2937', color: '#f9fafb', borderRadius: '10px', border: '1px solid #374151' },
                success: { style: { background: '#065f46', color: '#ecfdf5', border: '1px solid #10b981' } },
                error:   { style: { background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' } },
                loading: { style: { background: '#1e3a5f', color: '#bfdbfe', border: '1px solid #3b82f6' } },
            }} />

            <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 md:p-6">

                {/* Judul + Template */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Praktikum</h1>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Kelola tugas praktikum dan pantau pengumpulan mahasiswa.</p>
                    </div>
                    {templateExists ? (
                        <a href="/instructor/praktikum/template/download"
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Unduh Template Laporan</span>
                            <span className="sm:hidden">Template</span>
                        </a>
                    ) : (
                        <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Template Belum Tersedia</span>
                        </span>
                    )}
                </div>

                {/* Tab */}
                <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
                    {[
                        { id: 'assignments', label: 'Daftar Praktikum', icon: Upload },
                        { id: 'analytics',   label: 'Analisis',         icon: BarChart3 },
                    ].map(({ id, label, icon: Icon }) => (
                        <button key={id}
                            onClick={() => { setActiveTab(id as any); setSelectedAssignment(null); }}
                            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === id
                                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}>
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* ════ Tab: Daftar Praktikum ════ */}
                {activeTab === 'assignments' && !selectedAssignment && (
                    <div className="space-y-5">
                        {/* Cari & Buat */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Cari praktikum atau modul…"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <button onClick={openCreate}
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 active:scale-95">
                                <Plus className="h-4 w-4" />Buat Praktikum Baru
                            </button>
                        </div>

                        {byModule.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                                <Upload className="mx-auto mb-3 h-14 w-14 text-gray-300" />
                                <h3 className="mb-1 text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    {searchTerm ? 'Praktikum tidak ditemukan' : 'Belum ada praktikum'}
                                </h3>
                                <p className="mb-5 text-sm text-gray-400">
                                    {searchTerm ? 'Coba kata kunci yang berbeda.' : 'Mulai dengan membuat praktikum pertama.'}
                                </p>
                                {!searchTerm && (
                                    <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white transition-colors hover:bg-blue-500">
                                        <Plus className="h-4 w-4" />Buat Praktikum Pertama
                                    </button>
                                )}
                            </div>
                        ) : byModule.map(({ module, list }) => {
                            const activeCount = list.filter(a => a.status === 'active').length;
                            return (
                                <div key={module.id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{module.title}</h2>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-400">{list.length} praktikum</span>
                                            {activeCount === 0 && (
                                                <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 font-medium text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    ⚠ Tidak ada yang aktif
                                                </span>
                                            )}
                                            {activeCount > 1 && (
                                                <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    ⚠ {activeCount} aktif sekaligus
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {list.map(a => {
                                            const isActive      = a.status === 'active';
                                            const otherDrafts   = list.filter(x => x.status === 'draft' && x.id !== a.id);
                                            const canDeactivate = otherDrafts.length > 0 || !isActive;
                                            const canDelete     = !(isActive && list.filter(x => x.id !== a.id).length === 0);

                                            return (
                                                <div key={a.id}
                                                    className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                                    onClick={() => openDetail(a)}>

                                                    {/* Header Kartu */}
                                                    <div className="mb-3 flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                                {a.title}
                                                            </h3>
                                                            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                isActive
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                            }`}>
                                                                {isActive ? '● Aktif' : '○ Draf'}
                                                            </span>
                                                        </div>
                                                        {/* Tombol Aksi */}
                                                        <div className="flex flex-shrink-0 items-center gap-0.5" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => handleToggleClick(a)}
                                                                disabled={isActive && !canDeactivate}
                                                                title={isActive ? (canDeactivate ? 'Nonaktifkan' : 'Tidak ada draf pengganti') : 'Aktifkan'}
                                                                className={`rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                                                                    isActive ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                                }`}>
                                                                {isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                                                            </button>
                                                            <button onClick={() => openEdit(a)} title="Edit"
                                                                className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button onClick={() => handleDeleteClick(a)} disabled={!canDelete} title="Hapus"
                                                                className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Statistik Mini */}
                                                    <div className="mb-3 grid grid-cols-3 gap-2">
                                                        <div className="rounded-lg bg-blue-50 py-2 text-center dark:bg-blue-900/20">
                                                            <ListTodo className="mx-auto mb-0.5 h-4 w-4 text-blue-500" />
                                                            <p className="text-lg font-bold text-blue-600">{a.tasks?.length ?? 0}</p>
                                                            <p className="text-xs text-gray-500">Tugas</p>
                                                        </div>
                                                        <div className="rounded-lg bg-emerald-50 py-2 text-center dark:bg-emerald-900/20">
                                                            <Users className="mx-auto mb-0.5 h-4 w-4 text-emerald-500" />
                                                            <p className="text-lg font-bold text-emerald-600">{a.submissions ?? 0}</p>
                                                            <p className="text-xs text-gray-500">Dikumpulkan</p>
                                                        </div>
                                                        <div className="rounded-lg bg-purple-50 py-2 text-center dark:bg-purple-900/20">
                                                            <Award className="mx-auto mb-0.5 h-4 w-4 text-purple-500" />
                                                            <p className="text-lg font-bold text-purple-600">{a.averageScore}</p>
                                                            <p className="text-xs text-gray-500">Rata-rata</p>
                                                        </div>
                                                    </div>

                                                    {/* Pratinjau Daftar Tugas */}
                                                    {a.tasks && a.tasks.length > 0 && (
                                                        <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 p-2.5 dark:border-blue-900/30 dark:bg-blue-900/10">
                                                            <p className="mb-1.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                                                                Daftar Tugas:
                                                            </p>
                                                            <ul className="space-y-1">
                                                                {a.tasks.slice(0, 3).map((t, i) => (
                                                                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                                                            {i + 1}
                                                                        </span>
                                                                        <span className="line-clamp-1">{t}</span>
                                                                    </li>
                                                                ))}
                                                                {a.tasks.length > 3 && (
                                                                    <li className="text-xs text-blue-500 dark:text-blue-400">
                                                                        +{a.tasks.length - 3} tugas lainnya…
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                                        {a.deadline && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {fmtDeadline(a.deadline)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ════ Tab: Detail Pengumpulan ════ */}
                {activeTab === 'assignments' && selectedAssignment && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedAssignment(null)}
                                className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                                <ArrowLeft className="h-5 w-5" /><span className="hidden sm:inline">Kembali</span>
                            </button>
                            <div className="min-w-0 flex-1">
                                <h2 className="truncate text-xl font-bold text-gray-900 dark:text-white">{selectedAssignment.title}</h2>
                                <p className="text-xs text-gray-500">{selectedAssignment.moduleName}</p>
                            </div>
                        </div>

                        {/* Daftar Tugas (dari database) */}
                        {selectedAssignment.tasks && selectedAssignment.tasks.length > 0 && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                <div className="mb-3 flex items-center gap-2">
                                    <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                        Daftar Tugas ({selectedAssignment.tasks.length} tugas)
                                    </h3>
                                </div>
                                <ol className="space-y-2">
                                    {selectedAssignment.tasks.map((t, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                                {i + 1}
                                            </span>
                                            <p className="pt-0.5 text-sm text-blue-900 dark:text-blue-100">{t}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Statistik */}
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {[
                                { icon: Users,       val: submissions.length, label: 'Total Pengumpulan', color: 'blue' },
                                { icon: CheckCircle, val: submissions.filter(s => s.score !== null).length, label: 'Sudah Dinilai', color: 'emerald' },
                                { icon: Clock,       val: submissions.filter(s => s.score === null).length, label: 'Belum Dinilai', color: 'amber' },
                                { icon: Award,       val: (() => {
                                    const g = submissions.filter(s => s.score !== null);
                                    return g.length > 0 ? Math.round(g.reduce((sum, s) => sum + (s.score ?? 0), 0) / g.length) : 0;
                                })(), label: 'Rata-rata Nilai', color: 'purple' },
                            ].map(({ icon: Icon, val, label, color }) => (
                                <div key={label} className={`rounded-xl border border-${color}-200 bg-${color}-50 p-4 dark:border-${color}-800 dark:bg-${color}-900/20`}>
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                                        <Icon className={`h-4 w-4 text-${color}-600`} />
                                    </div>
                                    <p className={`text-2xl font-bold text-${color}-600`}>{val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Tabel Pengumpulan */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Daftar Pengumpulan Mahasiswa</h3>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {subLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                                    </div>
                                ) : submissions.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <FileText className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                        <p className="text-sm text-gray-400">Belum ada mahasiswa yang mengumpulkan tugas.</p>
                                    </div>
                                ) : submissions.map(s => (
                                    <div key={s.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{s.studentName}</h4>
                                                <span className="text-xs text-gray-400">{s.nim}</span>
                                                {s.score !== null && (
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : s.score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                        Nilai: {s.score}
                                                    </span>
                                                )}
                                                {s.isLate && (
                                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                                        Terlambat {Math.abs(Math.floor(s.daysLate))} hari
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:gap-3">
                                                <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /><span className="truncate">{s.fileName}</span></span>
                                                <span className="hidden sm:inline">·</span>
                                                <span>{s.fileSize}</span>
                                                <span className="hidden sm:inline">·</span>
                                                <span>{new Date(s.submittedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setPdfPreview({ url: `/instructor/praktikum/submissions/${s.id}/preview`, sub: s })}
                                                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-500">
                                                <Eye className="h-4 w-4" /><span className="hidden sm:inline">Lihat</span>
                                            </button>
                                            <button onClick={() => openGrade(s)}
                                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-emerald-500">
                                                <Star className="h-4 w-4" /><span className="hidden sm:inline">Nilai</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ Tab: Analisis ════ */}
                {activeTab === 'analytics' && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analisis Performa Praktikum</h2>
                        {analyticsLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                            </div>
                        ) : analytics ? (
                            <>
                                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    {[
                                        { icon: Upload,        color: 'blue',    label: 'Total Praktikum',       val: analytics.totalAssignments  ?? 0 },
                                        { icon: Users,         color: 'emerald', label: 'Total Pengumpulan',     val: analytics.totalSubmissions  ?? 0 },
                                        { icon: Award,         color: 'orange',  label: 'Rata-rata Nilai',       val: analytics.averageScore      ?? 0 },
                                        { icon: AlertTriangle, color: 'red',     label: 'Pengumpulan Terlambat', val: analytics.lateSubmissions   ?? 0 },
                                    ].map(({ icon: Icon, color, label, val }) => (
                                        <div key={label} className={`rounded-xl border border-${color}-200 bg-${color}-50 p-4 dark:border-${color}-800 dark:bg-${color}-900/20`}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                                                <Icon className={`h-4 w-4 text-${color}-600`} />
                                            </div>
                                            <p className={`text-2xl font-bold text-${color}-600`}>{val}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <BarChart3 className="mx-auto mb-3 h-14 w-14 text-gray-300" />
                                <p className="text-sm text-gray-400">Belum ada data analisis.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ════ Modal Pratinjau PDF ════ */}
            {pdfPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
                    <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-xl bg-white dark:bg-gray-800">
                        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                                    {pdfPreview.sub.studentName} — {pdfPreview.sub.assignmentTitle}
                                </h3>
                                <p className="truncate text-xs text-gray-400">File: {pdfPreview.sub.fileName}</p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                                <a href={`/instructor/praktikum/submissions/${pdfPreview.sub.id}/download`}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-500">
                                    <Download className="h-4 w-4" /><span className="hidden sm:inline">Unduh</span>
                                </a>
                                <button onClick={() => { setPdfPreview(null); openGrade(pdfPreview.sub); }}
                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-500">
                                    <Star className="h-4 w-4" /><span className="hidden sm:inline">Beri Nilai</span>
                                </button>
                                <button onClick={() => setPdfPreview(null)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden p-4">
                            <iframe src={pdfPreview.url} className="h-full w-full rounded-lg border border-gray-300 dark:border-gray-600" title="Pratinjau PDF" />
                        </div>
                    </div>
                </div>
            )}

            {/* ════ Modal Buat / Edit ════ */}
            {modalMode && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
                    <div className="my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
                        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {modalMode === 'create' ? 'Buat Praktikum Baru' : 'Edit Praktikum'}
                            </h3>
                            <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="max-h-[calc(90vh-160px)] overflow-y-auto p-5">
                            <div className="space-y-5">
                                {/* Judul & Modul */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Judul <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" value={assignmentForm.data.title}
                                            onChange={e => assignmentForm.setData('title', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            placeholder="Contoh: Laporan Praktikum 1 — Pengenalan C++"
                                        />
                                        {assignmentForm.errors.title && <p className="mt-1 text-xs text-red-500">{assignmentForm.errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Modul <span className="text-red-500">*</span>
                                        </label>
                                        <select value={assignmentForm.data.module_id}
                                            onChange={e => assignmentForm.setData('module_id', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                                            <option value="">Pilih Modul…</option>
                                            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                        </select>
                                        {assignmentForm.errors.module_id && <p className="mt-1 text-xs text-red-500">{assignmentForm.errors.module_id}</p>}
                                    </div>
                                </div>

                                {/* Deskripsi Tugas */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Deskripsi Tugas <span className="text-red-500">*</span>
                                    </label>
                                    <textarea rows={4} value={assignmentForm.data.description}
                                        onChange={e => assignmentForm.setData('description', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        placeholder="Contoh: Kerjakan seluruh soal latihan dan tugas rumah pada Modul 1. Dokumentasikan setiap langkah pengerjaan sesuai format laporan."
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Jelaskan soal yang dikerjakan, format laporan, dan ketentuan lain.</p>
                                    {assignmentForm.errors.description && <p className="mt-1 text-xs text-red-500">{assignmentForm.errors.description}</p>}
                                </div>

                                {/* ── Daftar Tugas (tasks) ── */}
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                                    <TasksEditor
                                        tasks={formTasks}
                                        onChange={setFormTasks}
                                        error={(assignmentForm.errors as any)['tasks'] ?? (assignmentForm.errors as any)['tasks.0']}
                                    />
                                </div>

                                {/* Petunjuk Pengerjaan */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Petunjuk Pengerjaan <span className="text-gray-400">(Opsional)</span>
                                    </label>
                                    <textarea rows={4} value={assignmentForm.data.instructions}
                                        onChange={e => assignmentForm.setData('instructions', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        placeholder={'1. Unduh template laporan.\n2. Kerjakan soal latihan dan tugas rumah.\n3. Sertakan tangkapan layar keluaran.\n4. Simpan sebagai PDF lalu unggah sebelum batas waktu.'}
                                    />
                                </div>

                                {/* Batas Waktu per Kelas */}
                                <div className="border-t pt-5">
                                    <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Batas Waktu per Kelas</h4>
                                    <p className="mb-4 text-xs text-gray-400">Setiap kelas dapat memiliki batas waktu yang berbeda.</p>
                                    <div className="space-y-3">
                                        {classes.map((cls, idx) => (
                                            <div key={cls.id} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700 sm:flex-row sm:items-center">
                                                <div className="flex-1">
                                                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">📚 Kelas {cls.name}</label>
                                                    <input type="datetime-local"
                                                        value={assignmentForm.data.class_deadlines[idx]?.deadline ?? ''}
                                                        onChange={e => {
                                                            const dl = [...assignmentForm.data.class_deadlines];
                                                            dl[idx] = { class_id: String(cls.id), deadline: e.target.value };
                                                            assignmentForm.setData('class_deadlines', dl);
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                        required
                                                    />
                                                </div>
                                                {assignmentForm.data.class_deadlines[idx]?.deadline && (
                                                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 sm:mt-5">
                                                        <CheckCircle className="h-3.5 w-3.5" /><span>Sudah diatur</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Poin */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {[
                                        { label: 'Skor Maksimal',    key: 'max_score'           as const },
                                        { label: 'Poin Tepat Waktu', key: 'point_reward_ontime' as const },
                                        { label: 'Poin Terlambat',   key: 'point_reward_late'   as const },
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                                            <input type="number" value={(assignmentForm.data as any)[key]}
                                                onChange={e => assignmentForm.setData(key, parseInt(e.target.value))}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                min="0" max="200"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Status */}
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-3">
                                                <input type="checkbox" id="is_active" checked={assignmentForm.data.is_active}
                                                    onChange={e => assignmentForm.setData('is_active', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="is_active" className="cursor-pointer text-sm font-medium text-amber-800 dark:text-amber-200">
                                                    Aktifkan praktikum ini sekarang
                                                </label>
                                            </div>
                                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                                Jika diaktifkan, praktikum yang sedang aktif di modul yang sama akan otomatis dinonaktifkan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 flex flex-col-reverse items-stretch gap-3 rounded-b-2xl border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-700/50 sm:flex-row sm:items-center sm:justify-end">
                            <button onClick={() => setModalMode(null)}
                                className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600">
                                Batal
                            </button>
                            <button onClick={doSave} disabled={assignmentForm.processing}
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50">
                                <Save className="h-4 w-4" />
                                {assignmentForm.processing ? 'Menyimpan…' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════ Modal Beri Nilai ════ */}
            {showGradeModal && selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
                    <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
                        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Beri Nilai</h3>
                            <button onClick={() => setShowGradeModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[calc(90vh-160px)] overflow-y-auto p-5">
                            <div className="space-y-5">
                                <div className="rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-700">
                                    <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Informasi Pengumpulan</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><span className="text-gray-400">Mahasiswa</span><p className="font-medium text-gray-900 dark:text-white">{selectedSubmission.studentName}</p></div>
                                        <div><span className="text-gray-400">NIM</span><p className="font-medium text-gray-900 dark:text-white">{selectedSubmission.nim}</p></div>
                                        <div className="col-span-2"><span className="text-gray-400">File</span><p className="truncate font-medium text-gray-900 dark:text-white">{selectedSubmission.fileName}</p></div>
                                        <div><span className="text-gray-400">Ukuran</span><p className="font-medium text-gray-900 dark:text-white">{selectedSubmission.fileSize}</p></div>
                                        <div>
                                            <span className="text-gray-400">Status</span>
                                            <p className={`font-medium ${selectedSubmission.isLate ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {selectedSubmission.isLate
                                                    ? `Terlambat ${Math.abs(Math.floor(selectedSubmission.daysLate))} hari`
                                                    : `${Math.floor(selectedSubmission.daysEarly)} hari lebih awal`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nilai (0–100) <span className="text-red-500">*</span>
                                    </label>
                                    <input type="number" value={gradeForm.data.score}
                                        onChange={e => gradeForm.setData('score', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-center text-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        placeholder="85" min="0" max="100"
                                    />
                                    {gradeForm.errors.score && <p className="mt-1 text-xs text-red-500">{gradeForm.errors.score}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Umpan Balik <span className="text-gray-400">(Opsional)</span>
                                    </label>
                                    <textarea rows={4} value={gradeForm.data.feedback}
                                        onChange={e => gradeForm.setData('feedback', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        placeholder="Berikan umpan balik yang membangun…"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col-reverse items-stretch gap-3 rounded-b-2xl border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-700/50 sm:flex-row sm:items-center sm:justify-end">
                            <button onClick={() => setShowGradeModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600">Batal</button>
                            {pdfPreview === null && (
                                <button onClick={() => setPdfPreview({ url: `/instructor/praktikum/submissions/${selectedSubmission.id}/preview`, sub: selectedSubmission })}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500">
                                    <Eye className="h-4 w-4" />Lihat File
                                </button>
                            )}
                            <button onClick={doGrade} disabled={gradeForm.processing || !gradeForm.data.score}
                                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50">
                                <Save className="h-4 w-4" />{gradeForm.processing ? 'Menyimpan…' : 'Simpan Nilai'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog Konfirmasi Toggle */}
            {toggleConfirm && (
                <ConfirmToggleModal
                    assignment={toggleConfirm.assignment}
                    activeTitle={toggleConfirm.activeTitle}
                    mode={toggleConfirm.mode}
                    hasDraft={toggleConfirm.hasDraft}
                    onConfirm={executeToggle}
                    onCancel={() => setToggleConfirm(null)}
                />
            )}

            {/* Dialog Konfirmasi Hapus */}
            {deleteConfirm && (
                <ConfirmDeleteModal
                    assignment={deleteConfirm.assignment}
                    blockedReason={deleteConfirm.blockedReason}
                    onConfirm={executeDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </AppLayout>
    );
}
