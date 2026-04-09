/**
 * resources/js/pages/Instructor/Quiz/ResultsPanel.tsx
 * Panel daftar hasil quiz mahasiswa. Mendukung multiple attempts.
 */

import React, { useState, useMemo } from 'react';
import {
    ArrowLeft, Users, CheckCircle, Award, Target,
    Eye, ClipboardList, X, AlertCircle, RotateCcw,
} from 'lucide-react';
import type { Quiz, QuizResult } from './Types';

interface Props {
    quiz: Quiz;
    results: QuizResult[];
    loading: boolean;
    onBack: () => void;
}

export default function ResultsPanel({ quiz, results, loading, onBack }: Props) {
    const [detail, setDetail] = useState<QuizResult | null>(null);

    const total    = results.length;
    const passed   = results.filter(r => r.score >= 60).length;
    const avgScore = total > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / total) : 0;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    // Kelompokkan per mahasiswa, tampilkan skor terbaik
    const byStudent = useMemo(() => {
        const map = new Map<string, QuizResult[]>();
        results.forEach(r => {
            const key = r.nim || r.studentName;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(r);
        });
        return Array.from(map.values()).map(list => ({
            best:     list.reduce((a, b) => a.score > b.score ? a : b),
            attempts: list,
        }));
    }, [results]);

    const scoreColor = (s: number) =>
        s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-red-500';

    const scoreBadge = (s: number) =>
        s >= 80
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : s >= 60
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';

    return (
        <div className="space-y-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>
                <span className="text-gray-300 dark:text-gray-600">/</span>
                <span className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">{quiz.title}</span>
                <span className="text-gray-400 text-xs hidden sm:inline">— {quiz.moduleName}</span>
            </div>

            {/* Kartu statistik */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { icon: Users,        bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',        color: 'text-blue-600',    label: 'Total Pengerjaan', val: total },
                    { icon: CheckCircle,  bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', color: 'text-emerald-600', label: 'Lulus',          val: passed },
                    { icon: Award,        bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',  color: 'text-purple-600',  label: 'Rata-rata Skor',  val: avgScore },
                    { icon: Target,       bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',  color: 'text-orange-600',  label: 'Tingkat Lulus',   val: `${passRate}%` },
                ].map(({ icon: Icon, bg, color, label, val }) => (
                    <div key={label} className={`${bg} border rounded-xl p-4`}>
                        <Icon className={`h-5 w-5 ${color} mb-2`} />
                        <p className={`text-2xl font-bold ${color}`}>{val}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Tabel hasil */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Hasil per Mahasiswa</h3>
                    <span className="text-xs text-gray-400">{byStudent.length} mahasiswa</span>
                </div>

                {loading ? (
                    <div className="py-10 text-center space-y-2">
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600 mx-auto" />
                        <p className="text-sm text-gray-400">Memuat data...</p>
                    </div>
                ) : byStudent.length === 0 ? (
                    <div className="py-10 text-center">
                        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Belum ada mahasiswa yang mengerjakan quiz ini.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {byStudent.map(({ best, attempts: att }) => (
                            <div
                                key={best.nim || best.studentName}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-gray-900 dark:text-white">{best.studentName}</span>
                                        <span className="text-xs text-gray-400">{best.nim}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${scoreBadge(best.score)}`}>
                                            {best.score >= 60 ? 'Lulus' : 'Tidak Lulus'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                                        <span>
                                            Skor terbaik: <strong className={scoreColor(best.score)}>{best.score}</strong>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <RotateCcw className="h-3 w-3" />
                                            {att.length}× percobaan
                                        </span>
                                        <span>
                                            Poin: +{att.reduce((s, a) => s + (a.pointsEarned ?? 0), 0)}
                                        </span>
                                        <span>
                                            {new Date(best.completedAt).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDetail(best)}
                                    className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Detail
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal detail */}
            {detail && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Detail Hasil Quiz</h3>
                            <button
                                onClick={() => setDetail(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                            {/* Info mahasiswa */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: 'Nama', val: detail.studentName },
                                    { label: 'NIM',  val: detail.nim },
                                    { label: 'Quiz', val: detail.quizTitle },
                                    {
                                        label: 'Selesai',
                                        val: new Date(detail.completedAt).toLocaleString('id-ID'),
                                    },
                                ].map(({ label, val }) => (
                                    <div key={label}>
                                        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                                        <p className="font-semibold text-gray-900 dark:text-white text-xs leading-snug">{val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Skor & poin */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-5 rounded-xl border-2 text-center ${
                                    detail.score >= 80
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                                        : detail.score >= 60
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                                }`}>
                                    <p className="text-xs text-gray-500 mb-1">Skor</p>
                                    <p className={`text-4xl font-black ${scoreColor(detail.score)}`}>{detail.score}</p>
                                </div>
                                <div className="p-5 rounded-xl border-2 bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Poin</p>
                                    <p className="text-4xl font-black text-purple-600">+{detail.pointsEarned}</p>
                                </div>
                            </div>

                            {/* Status lulus */}
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                                detail.score >= 60
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}>
                                {detail.score >= 60
                                    ? <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                    : <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                }
                                <div>
                                    <p className={`text-sm font-semibold ${detail.score >= 60 ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                                        {detail.score >= 60 ? '✓ Lulus' : '✗ Tidak Lulus'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {detail.score >= 60
                                            ? 'Mahasiswa mencapai nilai minimum kelulusan (60).'
                                            : 'Mahasiswa belum mencapai nilai minimum kelulusan (60).'}
                                    </p>
                                </div>
                            </div>

                            {/* Info percobaan */}
                            {detail.attempts && detail.attempts > 1 && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                                    <RotateCcw className="h-4 w-4 flex-shrink-0" />
                                    <span>
                                        Mahasiswa mengerjakan quiz ini sebanyak{' '}
                                        <strong>{detail.attempts}×</strong>.
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <button
                                onClick={() => setDetail(null)}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
