<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Module;
use App\Models\ClassModel;
use App\Models\QuizAttempt;
use App\Models\AssignmentSubmission;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // ── Statistik Pengguna ────────────────────────────────────────────────
        $totalPengguna   = User::count();
        $totalMahasiswa  = User::where('role', 'student')->count();
        $totalDosen      = User::where('role', 'instructor')->count();
        $totalAdmin      = User::where('role', 'admin')->count();

        // ── Statistik Konten ──────────────────────────────────────────────────
        $totalModul  = Module::count();
        $totalKelas  = ClassModel::count();

        // ── Statistik Aktivitas ───────────────────────────────────────────────
        $totalPercobaan  = QuizAttempt::whereNotNull('completed_at')->count();
        $totalPengumpulan = AssignmentSubmission::whereNotNull('submitted_at')->count();

        // ── Rata-rata Poin Mahasiswa ──────────────────────────────────────────
        $rataRataPoin = User::where('role', 'student')->avg('points') ?? 0;

        // ── Pengguna Baru (7 hari terakhir) ───────────────────────────────────
        $penggunaBaru = User::where('created_at', '>=', now()->subDays(7))->count();

        // ── Grafik Registrasi Per Bulan (12 bulan terakhir) ───────────────────
        $registrasiPerBulan = User::select(
                DB::raw('YEAR(created_at) as tahun'),
                DB::raw('MONTH(created_at) as bulan'),
                DB::raw('COUNT(*) as total')
            )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('tahun', 'bulan')
            ->orderBy('tahun')
            ->orderBy('bulan')
            ->get()
            ->map(fn($item) => [
                'label' => $item->tahun . '-' . str_pad($item->bulan, 2, '0', STR_PAD_LEFT),
                'total' => $item->total,
            ]);

        // ── Distribusi Peran ──────────────────────────────────────────────────
        $distribusiPeran = [
            ['peran' => 'Mahasiswa', 'total' => $totalMahasiswa],
            ['peran' => 'Dosen',     'total' => $totalDosen],
            ['peran' => 'Admin',     'total' => $totalAdmin],
        ];

        // ── Pengguna Terbaru ──────────────────────────────────────────────────
        $penggunaTerbaru = User::latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        // ── Top 5 Mahasiswa (berdasarkan poin) ───────────────────────────────
        $topMahasiswa = User::where('role', 'student')
            ->orderByDesc('points')
            ->take(5)
            ->get(['id', 'name', 'email', 'points']);

        return Inertia::render('admin/dashboard', [
            'statistik' => [
                'totalPengguna'    => $totalPengguna,
                'totalMahasiswa'   => $totalMahasiswa,
                'totalDosen'       => $totalDosen,
                'totalAdmin'       => $totalAdmin,
                'totalModul'       => $totalModul,
                'totalKelas'       => $totalKelas,
                'totalPercobaan'   => $totalPercobaan,
                'totalPengumpulan' => $totalPengumpulan,
                'rataRataPoin'     => round($rataRataPoin),
                'penggunaBaru'     => $penggunaBaru,
            ],
            'registrasiPerBulan' => $registrasiPerBulan,
            'distribusiPeran'    => $distribusiPeran,
            'penggunaTerbaru'    => $penggunaTerbaru,
            'topMahasiswa'       => $topMahasiswa,
        ]);
    }
}
