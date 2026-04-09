<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    /**
     * Tampilkan daftar seluruh pengguna.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filter berdasarkan peran
        if ($request->filled('peran') && $request->peran !== 'semua') {
            $roleMap = [
                'mahasiswa' => 'student',
                'dosen'     => 'instructor',
                'admin'     => 'admin',
            ];
            $role = $roleMap[$request->peran] ?? $request->peran;
            $query->where('role', $role);
        }

        // Pencarian berdasarkan nama atau surel
        if ($request->filled('cari')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->cari . '%')
                  ->orWhere('email', 'like', '%' . $request->cari . '%');
            });
        }

        $pengguna = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($user) => [
                'id'         => $user->id,
                'nama'       => $user->name,
                'surel'      => $user->email,
                'peran'      => $user->role,
                'poin'       => $user->points,
                'dibuat_pada' => $user->created_at->format('d M Y'),
            ]);

        // Ringkasan jumlah per peran
        $ringkasan = [
            'semua'     => User::count(),
            'mahasiswa' => User::where('role', 'student')->count(),
            'dosen'     => User::where('role', 'instructor')->count(),
            'admin'     => User::where('role', 'admin')->count(),
        ];

        return Inertia::render('admin/user', [
            'pengguna'  => $pengguna,
            'ringkasan' => $ringkasan,
            'filter'    => [
                'peran' => $request->peran ?? 'semua',
                'cari'  => $request->cari ?? '',
            ],
        ]);
    }

    /**
     * Ubah peran pengguna.
     */
    public function ubahPeran(Request $request, User $user)
    {
        // Admin tidak boleh mengubah perannya sendiri
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat mengubah peran akun Anda sendiri.');
        }

        $request->validate([
            'peran' => ['required', Rule::in(['student', 'instructor', 'admin'])],
        ], [
            'peran.required' => 'Peran wajib dipilih.',
            'peran.in'       => 'Peran tidak valid.',
        ]);

        $peranLama = $user->role;
        $user->update(['role' => $request->peran]);

        $labelPeran = [
            'student'    => 'Mahasiswa',
            'instructor' => 'Dosen',
            'admin'      => 'Admin',
        ];

        return back()->with('sukses', "Peran {$user->name} berhasil diubah dari {$labelPeran[$peranLama]} menjadi {$labelPeran[$request->peran]}.");
    }

    /**
     * Tampilkan detail pengguna.
     */
    public function tampil(User $user)
    {
        $detail = [
            'id'         => $user->id,
            'nama'       => $user->name,
            'surel'      => $user->email,
            'peran'      => $user->role,
            'poin'       => $user->points,
            'dibuat_pada' => $user->created_at->format('d M Y H:i'),
        ];

        // Statistik tambahan untuk mahasiswa
        $statistikTambahan = null;
        if ($user->role === 'student') {
            $statistikTambahan = [
                'total_percobaan_kuis' => $user->quizAttempts()->whereNotNull('completed_at')->count(),
                'total_pengumpulan'    => $user->assignmentSubmissions()->whereNotNull('submitted_at')->count(),
                'kelas'                => $user->classes()->pluck('name'),
            ];
        }

        // Statistik untuk dosen
        if ($user->role === 'instructor') {
            $statistikTambahan = [
                'total_kelas' => $user->instructorClasses()->count(),
            ];
        }

        return Inertia::render('admin/user/tampil', [
            'pengguna'           => $detail,
            'statistikTambahan'  => $statistikTambahan,
        ]);
    }

    /**
     * Hapus pengguna.
     */
    public function hapus(User $user)
    {
        // Admin tidak boleh menghapus dirinya sendiri
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $namaUser = $user->name;
        $user->delete();

        return back()->with('sukses', "Pengguna {$namaUser} berhasil dihapus.");
    }
}
