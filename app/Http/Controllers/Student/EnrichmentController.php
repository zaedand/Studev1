<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrichment;
use App\Models\Module;
use App\Models\UserEnrichment;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EnrichmentController extends Controller
{
    public function markCompleted(Request $request, $enrichmentItemId)
    {
        $user = auth()->user();

        $request->validate([
            'type' => 'required|in:video,link',
            'module_id' => 'required|exists:modules,id',
        ]);

        $type = $request->input('type');
        $moduleId = $request->input('module_id');

        // Cari item enrichment
        $enrichmentItem = Enrichment::where('id', $enrichmentItemId)
            ->where('module_id', $moduleId)
            ->where('type', $type)
            ->first();

        if (!$enrichmentItem) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Item enrichment tidak ditemukan.',
                ]
            ]);
        }

        $reward = (int) $enrichmentItem->point_reward;

        // Buat atau ambil record user enrichment
        $userEnrichment = UserEnrichment::firstOrCreate(
            [
                'user_id' => $user->id,
                'module_id' => $moduleId,
            ],
            [
                'watched_videos' => [],
                'completed_links' => [],
                'completed' => false,
            ]
        );

        // Pastikan data array tidak null
        $watchedVideos = is_array($userEnrichment->watched_videos)
            ? $userEnrichment->watched_videos
            : [];

        $completedLinks = is_array($userEnrichment->completed_links)
            ? $userEnrichment->completed_links
            : [];

        // Update berdasarkan tipe
        if ($type === 'video') {
            // Cek duplikasi dengan cara yang aman
            $alreadyWatched = false;
            foreach ($watchedVideos as $video) {
                $videoId = is_array($video) ? ($video['id'] ?? null) : $video;
                if ($videoId == $enrichmentItemId) {
                    $alreadyWatched = true;
                    break;
                }
            }

            if ($alreadyWatched) {
                return back()->with([
                    'flash' => [
                        'info' => true,
                        'message' => 'Video ini sudah ditandai selesai sebelumnya.',
                    ]
                ]);
            }

            // Tambahkan video baru
            $watchedVideos[] = [
                'id' => (int) $enrichmentItemId,
                'completed_at' => now()->toDateTimeString(),
                'points_earned' => $reward,
            ];

            $userEnrichment->watched_videos = $watchedVideos;
            $userEnrichment->save();

        } else { // link
            // Cek duplikasi dengan cara yang aman
            $alreadyCompleted = false;
            foreach ($completedLinks as $link) {
                $linkId = is_array($link) ? ($link['id'] ?? null) : $link;
                if ($linkId == $enrichmentItemId) {
                    $alreadyCompleted = true;
                    break;
                }
            }

            if ($alreadyCompleted) {
                return back()->with([
                    'flash' => [
                        'info' => true,
                        'message' => 'Link ini sudah ditandai selesai sebelumnya.',
                    ]
                ]);
            }

            // Tambahkan link baru
            $completedLinks[] = [
                'id' => (int) $enrichmentItemId,
                'completed_at' => now()->toDateTimeString(),
                'points_earned' => $reward,
            ];

            $userEnrichment->completed_links = $completedLinks;
            $userEnrichment->save();
        }

        // ✅ TAMBAHAN: Track di user_progress (polymorphic)
        UserProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'progressable_type' => Enrichment::class,
                'progressable_id' => $enrichmentItemId,
            ],
            [
                'is_completed' => true,
                'points_earned' => $reward,
                'completed_at' => now(),
            ]
        );

        // Tambahkan poin
        $user->increment('points', $reward);

        // Cek apakah semua enrichment sudah selesai
        $this->checkEnrichmentCompletion($userEnrichment);

        return back()->with([
            'flash' => [
                'success' => true,
                'message' => ucfirst($type) . " berhasil ditandai selesai! Anda mendapatkan {$reward} poin 🔥",
                'total_points' => $user->fresh()->points,
            ]
        ]);
    }

    private function checkEnrichmentCompletion(UserEnrichment $userEnrichment)
    {
        $module = Module::find($userEnrichment->module_id);
        if (!$module) return;

        // Hitung total items
        $totalVideos = Enrichment::where('module_id', $module->id)
            ->where('type', 'video')
            ->count();

        $totalLinks = Enrichment::where('module_id', $module->id)
            ->where('type', 'link')
            ->count();

        // Hitung completed items - pastikan array
        $watchedVideos = is_array($userEnrichment->watched_videos)
            ? $userEnrichment->watched_videos
            : [];

        $completedLinks = is_array($userEnrichment->completed_links)
            ? $userEnrichment->completed_links
            : [];

        $completedVideos = count($watchedVideos);
        $completedLinks = count($completedLinks);

        // Update status jika semua selesai
        if ($completedVideos >= $totalVideos && $completedLinks >= $totalLinks && !$userEnrichment->completed) {
            $userEnrichment->update([
                'completed' => true,
                'completed_at' => now(),
            ]);
        }
    }
}
