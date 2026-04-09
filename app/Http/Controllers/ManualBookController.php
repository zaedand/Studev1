<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ManualBookController extends Controller
{
    /**
     * Display the manual book viewer
     */
    public function index()
    {
        // Path ke file manual book di storage
        $manualBookPath = 'manual-books/user-manual.pdf';

        // Check if file exists
        $fileExists = Storage::disk('public')->exists($manualBookPath);

        if (!$fileExists) {
            return redirect()->route('dashboard')->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Manual book tidak ditemukan. Silakan hubungi administrator.'
                ]
            ]);
        }

        // Get file info
        $fileSize = Storage::disk('public')->size($manualBookPath);
        $fileSizeInMB = round($fileSize / 1024 / 1024, 2);

        $manualBookData = [
            'title' => 'Manual Book - Panduan Pengguna Sistem',
            'file_path' => $manualBookPath,
            'file_size' => $fileSizeInMB . ' MB',
            'file_url' => asset('storage/' . $manualBookPath),
            'last_updated' => date('d M Y', Storage::disk('public')->lastModified($manualBookPath)),
        ];

        return Inertia::render('ManualBook', [
            'manualBook' => $manualBookData,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('dashboard')],
                ['label' => 'Manual Book', 'url' => null],
            ]
        ]);
    }

    /**
     * Download the manual book
     */
    public function download()
    {
        $manualBookPath = 'manual-books/user-manual.pdf';

        if (!Storage::disk('public')->exists($manualBookPath)) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'File tidak ditemukan'
                ]
            ]);
        }

        return Storage::disk('public')->download(
            $manualBookPath,
            'Manual_Book_Sistem_' . date('Y-m-d') . '.pdf'
        );
    }

    /**
     * Open manual book in new tab
     */
    public function view()
    {
        $manualBookPath = 'manual-books/user-manual.pdf';

        if (!Storage::disk('public')->exists($manualBookPath)) {
            abort(404, 'Manual book tidak ditemukan');
        }

        $filePath = Storage::disk('public')->path($manualBookPath);

        return response()->file($filePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="Manual_Book.pdf"'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | INSTRUCTOR MANUAL BOOK METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Display instructor manual book viewer
     */
    public function instructor()
    {
        $manualBookPath = 'manual-books/instructor-manual.pdf';

        // Check if file exists
        if (!Storage::disk('public')->exists($manualBookPath)) {
            return redirect()->route('instructor.dashboard')->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Manual book instructor tidak ditemukan. Silakan hubungi administrator.'
                ]
            ]);
        }

        // Get file info
        $fileSize = Storage::disk('public')->size($manualBookPath);
        $fileSizeInMB = round($fileSize / 1024 / 1024, 2);

        $manualBookData = [
            'title' => 'Manual Book - Panduan Instructor',
            'file_path' => $manualBookPath,
            'file_size' => $fileSizeInMB . ' MB',
            'file_url' => asset('storage/' . $manualBookPath),
            'last_updated' => date('d M Y', Storage::disk('public')->lastModified($manualBookPath)),
        ];

        return Inertia::render('Instructor/ManualBook', [
            'manualBook' => $manualBookData,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('instructor.dashboard')],
                ['label' => 'Manual Book', 'url' => null],
            ]
        ]);
    }

    /**
     * Download instructor manual book
     */
    public function downloadInstructor()
    {
        $manualBookPath = 'manual-books/instructor-manual.pdf';

        if (!Storage::disk('public')->exists($manualBookPath)) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'File tidak ditemukan'
                ]
            ]);
        }

        return Storage::disk('public')->download(
            $manualBookPath,
            'Manual_Book_Instructor_' . date('Y-m-d') . '.pdf'
        );
    }

    /**
     * Open instructor manual book in new tab
     */
    public function viewInstructor()
    {
        $manualBookPath = 'manual-books/instructor-manual.pdf';

        if (!Storage::disk('public')->exists($manualBookPath)) {
            abort(404, 'Manual book instructor tidak ditemukan');
        }

        $filePath = Storage::disk('public')->path($manualBookPath);

        return response()->file($filePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="Manual_Book_Instructor.pdf"'
        ]);
    }
}
