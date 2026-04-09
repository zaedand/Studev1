import React, { useState, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    X, Save, Plus, Trash2, CheckCircle, AlertCircle,
    ChevronDown, ChevronUp, Edit3, Eye,
} from 'lucide-react';
import type { Quiz, Module, Question, QuizFormData } from './Types';
import { EMPTY_QUESTION, EMPTY_FORM } from './Types';

// ─── QuestionEditor: state LOKAL ─────────────────────────────────────────────
// Tidak terhubung ke state parent sehingga setiap keystroke tidak
// memicu re-render seluruh modal → posisi kursor tidak pernah reset.
interface EditorProps {
    onAdd: (q: Question) => void;
}
function QuestionEditor({ onAdd }: EditorProps) {
    const [q, setQ] = useState<Question>({
        ...EMPTY_QUESTION,
        options: ['', '', '', ''],
    });

    const handleAdd = () => {
        if (!q.question.trim()) {
            toast.error('Teks soal tidak boleh kosong.');
            return;
        }
        if (q.options.filter(o => o.trim()).length < 2) {
            toast.error('Minimal 2 pilihan jawaban harus diisi.');
            return;
        }
        onAdd({ ...q });
        setQ({ ...EMPTY_QUESTION, options: ['', '', '', ''] });
        toast.success('Soal berhasil ditambahkan.');
    };

    return (
        <div className="space-y-4 bg-gray-50 dark:bg-gray-700/40 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Tambah Soal Baru
            </p>

            {/* Teks soal */}
            <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Teks Soal <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={q.question}
                    onChange={e => setQ(prev => ({ ...prev, question: e.target.value }))}
                    rows={3}
                    placeholder="Ketik pertanyaan di sini..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
            </div>

            {/* Pilihan jawaban */}
            <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Pilihan Jawaban <span className="text-red-500">*</span>
                    <span className="ml-1 font-normal text-gray-400">(klik radio = tandai jawaban benar)</span>
                </label>
                <div className="space-y-2">
                    {q.options.map((opt, i) => {
                        const letter    = String.fromCharCode(65 + i);
                        const isCorrect = q.correct_answer === letter;
                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                    isCorrect
                                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="editor_correct"
                                    checked={isCorrect}
                                    onChange={() => setQ(prev => ({ ...prev, correct_answer: letter }))}
                                    className="accent-emerald-600 flex-shrink-0 cursor-pointer"
                                    title={`Tandai ${letter} sebagai jawaban benar`}
                                />
                                <span className={`text-xs font-bold w-5 flex-shrink-0 ${isCorrect ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {letter}.
                                </span>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={e => {
                                        const opts = [...q.options];
                                        opts[i]    = e.target.value;
                                        setQ(prev => ({ ...prev, options: opts }));
                                    }}
                                    placeholder={`Pilihan ${letter}`}
                                    className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                />
                                {isCorrect && (
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Poin */}
            <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Poin per soal:
                </label>
                <input
                    type="number"
                    value={q.points}
                    onChange={e => setQ(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                    min={1} max={100}
                    className="w-20 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm px-4 py-2 rounded-lg transition-all"
            >
                <Plus className="h-4 w-4" />
                Tambah ke Daftar Soal
            </button>
        </div>
    );
}

// ─── QuestionList: daftar soal dengan accordion ──────────────────────────────
interface ListProps {
    questions: Question[];
    onRemove: (i: number) => void;
    readOnly?: boolean;
}
function QuestionList({ questions, onRemove, readOnly }: ListProps) {
    const [open, setOpen] = useState<number | null>(null);
    if (questions.length === 0) return null;

    return (
        <div className="space-y-2 mb-4">
            {questions.map((q, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                    {/* Baris ringkasan */}
                    <div
                        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setOpen(open === i ? null : i)}
                    >
                        <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{i + 1}</span>
                        </div>
                        <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{q.question}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400">{q.points} poin</span>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); onRemove(i); }}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Hapus soal ini"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {open === i
                                ? <ChevronUp className="h-4 w-4 text-gray-400" />
                                : <ChevronDown className="h-4 w-4 text-gray-400" />
                            }
                        </div>
                    </div>

                    {/* Detail soal (expand) */}
                    {open === i && (
                        <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-600 space-y-2">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{q.question}</p>
                            <div className="space-y-1.5">
                                {q.options.map((opt, oi) => {
                                    const letter  = String.fromCharCode(65 + oi);
                                    const correct = letter === q.correct_answer;
                                    return (
                                        <div
                                            key={oi}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                                                correct
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 font-medium'
                                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                            }`}
                                        >
                                            <span className={`font-bold w-5 flex-shrink-0 ${correct ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                {letter}.
                                            </span>
                                            <span className={`flex-1 ${correct ? 'text-emerald-800 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {opt || <em className="text-gray-400 font-normal">Kosong</em>}
                                            </span>
                                            {correct && (
                                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                    ✓ Benar
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── FormModal utama ──────────────────────────────────────────────────────────
interface Props {
    mode: 'create' | 'edit' | 'view';
    quiz?: Quiz | null;
    modules: Module[];
    initialForm?: QuizFormData;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FormModal({ mode, quiz, modules, initialForm, onClose, onSuccess }: Props) {
    const [form, setForm]   = useState<QuizFormData>(initialForm ?? { ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    // Sync saat initialForm tiba (setelah fetch selesai)
    useEffect(() => {
        if (initialForm) setForm(initialForm);
    }, [initialForm]);

    const set = useCallback(<K extends keyof QuizFormData>(k: K, v: QuizFormData[K]) => {
        setForm(prev => ({ ...prev, [k]: v }));
    }, []);

    const addQuestion  = useCallback((q: Question) => {
        setForm(prev => ({ ...prev, questions: [...prev.questions, q] }));
    }, []);

    const removeQuestion = useCallback((i: number) => {
        setForm(prev => ({ ...prev, questions: prev.questions.filter((_, idx) => idx !== i) }));
        toast.success('Soal dihapus.');
    }, []);

    const handleSubmit = () => {
        if (!form.title.trim())   { toast.error('Judul quiz belum diisi.');            return; }
        if (!form.module_id)      { toast.error('Modul belum dipilih.');               return; }
        if (!form.time_limit || Number(form.time_limit) < 5) {
            toast.error('Waktu pengerjaan belum diisi atau kurang dari 5 menit.');
            return;
        }
        if (form.questions.length === 0) { toast.error('Tambahkan minimal satu soal.'); return; }

        setSaving(true);
        const tid = toast.loading(mode === 'create' ? 'Membuat quiz...' : 'Menyimpan perubahan...');

        const payload = {
            module_id:   parseInt(form.module_id),
            title:       form.title.trim(),
            description: form.description?.trim() ?? '',
            time_limit:  Number(form.time_limit),
            questions:   JSON.stringify(form.questions),
        };

        const opts = {
            onSuccess: () => {
                toast.success(
                    mode === 'create' ? 'Quiz berhasil dibuat! 🎉' : 'Quiz berhasil diperbarui! ✅',
                    { id: tid }
                );
                setSaving(false);
                onSuccess();
            },
            onError: (err: Record<string, string>) => {
                const msg = Object.values(err)[0] ?? 'Terjadi kesalahan.';
                toast.error(msg, { id: tid });
                setSaving(false);
            },
        };

        if (mode === 'create') {
            router.post('/instructor/quiz', payload, opts);
        } else {
            router.put(`/instructor/quiz/${quiz!.id}`, payload, opts);
        }
    };

    const readOnly = mode === 'view';
    const title    = mode === 'create' ? 'Buat Quiz Baru' : mode === 'edit' ? 'Edit Quiz' : 'Detail Quiz';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/40">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        {readOnly
                            ? <Eye className="h-4 w-4 text-blue-500" />
                            : <Edit3 className="h-4 w-4 text-blue-500" />
                        }
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
                        {quiz?.hasAttempts && mode === 'edit' && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-600 px-2 py-0.5 rounded-full">
                                ⚠ Sudah dikerjakan
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

                    {/* Info dasar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Judul */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Judul Quiz <span className="text-red-500">*</span>
                            </label>
                            {readOnly
                                ? <p className="text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2.5 rounded-lg text-gray-900 dark:text-white">{form.title || '—'}</p>
                                : <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="Contoh: Quiz Bab 1 — Dasar Pemrograman"
                                    className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            }
                        </div>

                        {/* Modul */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Modul <span className="text-red-500">*</span>
                            </label>
                            {readOnly
                                ? <p className="text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2.5 rounded-lg text-gray-900 dark:text-white">
                                    {modules.find(m => m.id.toString() === form.module_id)?.title ?? '—'}
                                  </p>
                                : <select
                                    value={form.module_id}
                                    onChange={e => set('module_id', e.target.value)}
                                    className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">— Pilih Modul —</option>
                                    {modules.map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            }
                        </div>

                        {/* Waktu pengerjaan */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Waktu Pengerjaan (menit) <span className="text-red-500">*</span>
                            </label>
                            {readOnly
                                ? <p className="text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2.5 rounded-lg text-gray-900 dark:text-white">
                                    {form.time_limit} menit
                                  </p>
                                : <>
                                    <input
                                        type="number"
                                        /**
                                         * Gunakan value={form.time_limit} langsung (bisa string '').
                                         * Saat dikosongkan → '', saat diisi → angka.
                                         * parseInt dilakukan hanya saat submit.
                                         */
                                        value={form.time_limit}
                                        onChange={e =>
                                            set('time_limit', e.target.value === '' ? '' : parseInt(e.target.value))
                                        }
                                        placeholder="Contoh: 30"
                                        min={5} max={180}
                                        className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Rentang yang diizinkan: 5–180 menit</p>
                                  </>
                            }
                        </div>

                        {/* Deskripsi */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Deskripsi <span className="font-normal text-gray-400 normal-case">(opsional)</span>
                            </label>
                            {readOnly
                                ? <p className="text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 min-h-[2.5rem]">
                                    {form.description || '—'}
                                  </p>
                                : <textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    rows={2}
                                    placeholder="Petunjuk atau informasi tambahan untuk mahasiswa..."
                                    className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            }
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700" />

                    {/* Bagian soal */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Daftar Soal
                            </h4>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                {form.questions.length} soal
                            </span>
                        </div>

                        {form.questions.length === 0 && (
                            <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl mb-4">
                                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Belum ada soal. Tambahkan soal menggunakan form di bawah.</p>
                            </div>
                        )}

                        <QuestionList
                            questions={form.questions}
                            onRemove={removeQuestion}
                            readOnly={readOnly}
                        />

                        {!readOnly && <QuestionEditor onAdd={addQuestion} />}

                        {mode === 'edit' && quiz?.hasAttempts && (
                            <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    Soal tidak dapat diubah karena sudah ada mahasiswa yang mengerjakan quiz ini.
                                    Judul, modul, waktu, dan deskripsi masih dapat diperbarui.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 flex-shrink-0 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        {readOnly ? 'Tutup' : 'Batal'}
                    </button>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm px-5 py-2 rounded-lg transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Menyimpan...' : mode === 'create' ? 'Buat Quiz' : 'Simpan Perubahan'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
