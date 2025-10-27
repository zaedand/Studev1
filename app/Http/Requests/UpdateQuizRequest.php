<?php


// app/Http/Requests/UpdateQuizRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isInstructor();
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'module_id' => 'required|exists:modules,id',
            'time_limit' => 'nullable|integer|min:1|max:180',
            'questions' => 'required|array|min:1|max:50',
            'questions.*.id' => 'nullable|exists:quiz_questions,id',
            'questions.*.question' => 'required|string|max:1000',
            'questions.*.type' => 'required|in:multiple_choice,true_false,essay',
            'questions.*.options' => 'required_if:questions.*.type,multiple_choice|array|min:2|max:6',
            'questions.*.options.*' => 'required_with:questions.*.options|string|max:500',
            'questions.*.correct_answer' => 'required',
            'questions.*.points' => 'required|integer|min:1|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul quiz wajib diisi.',
            'module_id.required' => 'Modul harus dipilih.',
            'module_id.exists' => 'Modul yang dipilih tidak valid.',
            'questions.required' => 'Quiz harus memiliki minimal 1 soal.',
            'questions.min' => 'Quiz harus memiliki minimal 1 soal.',
            'questions.max' => 'Quiz maksimal memiliki 50 soal.',
            'questions.*.question.required' => 'Pertanyaan wajib diisi.',
            'questions.*.type.required' => 'Tipe soal wajib dipilih.',
            'questions.*.type.in' => 'Tipe soal tidak valid.',
            'questions.*.options.required_if' => 'Pilihan jawaban wajib diisi untuk soal pilihan ganda.',
            'questions.*.correct_answer.required' => 'Jawaban yang benar wajib dipilih.',
            'questions.*.points.required' => 'Poin soal wajib diisi.',
        ];
    }
}
