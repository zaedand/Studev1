<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleCpmk;
use App\Models\ModuleLearningObjective;
use App\Models\Material;
use App\Models\Enrichment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ModuleComponentController extends Controller
{
    // ==================== CPMK ====================

    public function storeCpmk(Request $request, Module $module)
    {
        $validated = $request->validate([
            'content' => 'required|array',
            'content.*' => 'required|string',
            'point_reward' => 'required|integer|min:0',
        ]);

        ModuleCpmk::create([
            'module_id' => $module->id,
            'content' => $validated['content'],
            'point_reward' => $validated['point_reward'],
        ]);

        return back()->with('success', 'CPMK added successfully!');
    }

    public function updateCpmk(Request $request, Module $module, ModuleCpmk $cpmk)
    {
        $validated = $request->validate([
            'content' => 'required|array',
            'content.*' => 'required|string',
            'point_reward' => 'required|integer|min:0',
        ]);

        $cpmk->update($validated);

        return back()->with('success', 'CPMK updated successfully!');
    }

    public function destroyCpmk(Module $module, ModuleCpmk $cpmk)
    {
        $cpmk->delete();
        return back()->with('success', 'CPMK deleted successfully!');
    }

    // ==================== Learning Objectives ====================

    public function storeLearningObjective(Request $request, Module $module)
    {
        $validated = $request->validate([
            'content' => 'required|array',
            'content.*' => 'required|string',
            'point_reward' => 'required|integer|min:0',
        ]);

        ModuleLearningObjective::create([
            'module_id' => $module->id,
            'content' => $validated['content'],
            'point_reward' => $validated['point_reward'],
        ]);

        return back()->with('success', 'Learning Objective added successfully!');
    }

    public function updateLearningObjective(Request $request, Module $module, ModuleLearningObjective $objective)
    {
        $validated = $request->validate([
            'content' => 'required|array',
            'content.*' => 'required|string',
            'point_reward' => 'required|integer|min:0',
        ]);

        $objective->update($validated);

        return back()->with('success', 'Learning Objective updated successfully!');
    }

    public function destroyLearningObjective(Module $module, ModuleLearningObjective $objective)
    {
        $objective->delete();
        return back()->with('success', 'Learning Objective deleted successfully!');
    }

    // ==================== Materials ====================

    public function storeMaterial(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf|max:20480', // 20MB
            'point_reward' => 'required|integer|min:0',
        ]);

        // Upload file
        $file = $request->file('file');
        $fileName = Str::slug($module->title) . '_' . time() . '.pdf';
        $filePath = $file->storeAs('materials', $fileName, 'public');

        Material::create([
            'module_id' => $module->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'point_reward' => $validated['point_reward'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Material uploaded successfully!');
    }

    public function updateMaterial(Request $request, Module $module, Material $material)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf|max:20480',
            'point_reward' => 'required|integer|min:0',
        ]);

        // If new file uploaded, delete old one
        if ($request->hasFile('file')) {
            if (Storage::disk('public')->exists($material->file_path)) {
                Storage::disk('public')->delete($material->file_path);
            }

            $file = $request->file('file');
            $fileName = Str::slug($module->title) . '_' . time() . '.pdf';
            $filePath = $file->storeAs('materials', $fileName, 'public');

            $validated['file_name'] = $fileName;
            $validated['file_path'] = $filePath;
            $validated['file_size'] = $file->getSize();
        }

        $material->update($validated);

        return back()->with('success', 'Material updated successfully!');
    }

    public function destroyMaterial(Module $module, Material $material)
    {
        // Delete file
        if (Storage::disk('public')->exists($material->file_path)) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return back()->with('success', 'Material deleted successfully!');
    }

    // ==================== Enrichments ====================

    public function storeEnrichment(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,link',
            'url' => 'required|url',
            'order_number' => 'required|integer|min:1',
            'point_reward' => 'required|integer|min:0',
        ]);

        Enrichment::create([
            'module_id' => $module->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'url' => $validated['url'],
            'order_number' => $validated['order_number'],
            'point_reward' => $validated['point_reward'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Enrichment added successfully!');
    }

    public function updateEnrichment(Request $request, Module $module, Enrichment $enrichment)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,link',
            'url' => 'required|url',
            'order_number' => 'required|integer|min:1',
            'point_reward' => 'required|integer|min:0',
        ]);

        $enrichment->update($validated);

        return back()->with('success', 'Enrichment updated successfully!');
    }

    public function destroyEnrichment(Module $module, Enrichment $enrichment)
    {
        $enrichment->delete();
        return back()->with('success', 'Enrichment deleted successfully!');
    }
}
