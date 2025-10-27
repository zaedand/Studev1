<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrichment;
use App\Models\UserEnrichment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnrichmentController extends Controller
{
    /**
     * Tampilkan detail pengayaan
     */
    public function show($enrichmentId)
    {
        $enrichment = Enrichment::with(['module', 'videos', 'links'])
            ->findOrFail($enrichmentId);

        $userEnrichment = UserEnrichment::where('user_id', auth()->id())
            ->where('enrichment_id', $enrichmentId)
            ->first();

        $watchedVideos = $userEnrichment?->watched_videos ?? [];

        $breadcrumbs = [
            ['label' => 'Dashboard', 'href' => route('dashboard')],
            ['label' => 'Modul', 'href' => route('modules.index')],
            ['label' => $enrichment->module->title, 'href' => route('modules.show', $enrichment->module_id)],
            ['label' => 'Pengayaan', 'href' => '#'],
        ];

        $enrichmentData = [
            'id' => $enrichment->id,
            'title' => $enrichment->title,
            'description' => $enrichment->description,
            'points' => $enrichment->point_reward,
            'completed' => $userEnrichment?->completed ?? false,
            'completedAt' => $userEnrichment?->completed_at,
            'module' => [
                'id' => $enrichment->module->id,
                'title' => $enrichment->module->title,
                'color' => $enrichment->module->color,
            ],
            'videos' => $enrichment->videos->map(function ($video) use ($watchedVideos) {
                return [
                    'id' => $video->id,
                    'title' => $video->title,
                    'platform' => $video->platform,
                    'duration' => $video->duration,
                    'url' => $video->url,
                    'thumbnail' => $video->thumbnail_url,
                    'watched' => in_array($video->id, $watchedVideos),
                    'order' => $video->order,
                ];
            })->sortBy('order')->values(),
            'links' => $enrichment->links->map(function ($link) {
                return [
                    'id' => $link->id,
                    'title' => $link->title,
                    'url' => $link->url,
                    'type' => $link->type,
                    'description' => $link->description,
                    'order' => $link->order,
                ];
            })->sortBy('order')->values(),
        ];

        return Inertia::render('Enrichment/Show', [
            'enrichment' => $enrichmentData,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Tandai video sebagai telah ditonton
     */
    public function markVideoWatched(Request $request, $enrichmentId)
    {
        $request->validate([
            'video_id' => 'required|exists:enrichment_videos,id',
        ]);

        $userEnrichment = UserEnrichment::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'enrichment_id' => $enrichmentId,
            ],
            [
                'watched_videos' => [],
                'completed' => false,
            ]
        );

        $watchedVideos = $userEnrichment->watched_videos ?? [];

        if (!in_array($request->video_id, $watchedVideos)) {
            $watchedVideos[] = $request->video_id;
            $userEnrichment->watched_videos = $watchedVideos;
            $userEnrichment->save();
        }

        $enrichment = Enrichment::with('videos')->findOrFail($enrichmentId);
        $allVideosWatched = count($watchedVideos) >= $enrichment->videos->count();

        if ($allVideosWatched && !$userEnrichment->completed) {
            $userEnrichment->update([
                'completed' => true,
                'completed_at' => now(),
            ]);

            $user = auth()->user();
            $reward = (int) $enrichment->point_reward;
            $user->increment('points', $reward);
        }

        return back()->with('success', 'Video ditandai sebagai telah ditonton');
    }

    /**
     * Tandai pengayaan sebagai selesai
     */
    public function markCompleted($enrichmentId)
    {
        $enrichment = Enrichment::findOrFail($enrichmentId);
        $user = auth()->user();
        $reward = (int) $enrichment->point_reward;

        $userEnrichment = UserEnrichment::firstOrCreate(
            [
                'user_id' => $user->id,
                'enrichment_id' => $enrichmentId,
            ],
            [
                'watched_videos' => [],
            ]
        );

        if (!$userEnrichment->completed) {
            $userEnrichment->update([
                'completed' => true,
                'completed_at' => now(),
            ]);

            $user->increment('points', $reward);

            return back()->with('success', "Pengayaan berhasil diselesaikan! Anda mendapatkan {$reward} poin.");
        }

        return back()->with('info', 'Pengayaan sudah diselesaikan sebelumnya.');
    }

    /**
     * Lacak klik pada link (opsional)
     */
    public function trackLinkClick(Request $request, $enrichmentId)
    {
        $request->validate([
            'link_id' => 'required|exists:enrichment_links,id',
        ]);

        // Bisa ditambahkan logika untuk mencatat klik link

        return response()->json(['success' => true]);
    }

    /**
     * Dapatkan progres pengayaan user
     */
    public function getProgress($enrichmentId)
    {
        $enrichment = Enrichment::with('videos')->findOrFail($enrichmentId);

        $userEnrichment = UserEnrichment::where('user_id', auth()->id())
            ->where('enrichment_id', $enrichmentId)
            ->first();

        $totalVideos = $enrichment->videos->count();
        $watchedVideos = $userEnrichment ? count($userEnrichment->watched_videos ?? []) : 0;

        return response()->json([
            'completed' => $userEnrichment?->completed ?? false,
            'total_videos' => $totalVideos,
            'watched_videos' => $watchedVideos,
            'progress_percentage' => $totalVideos > 0
                ? round(($watchedVideos / $totalVideos) * 100)
                : 0,
        ]);
    }
}
