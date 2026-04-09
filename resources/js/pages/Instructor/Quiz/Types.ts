// resources/js/pages/Instructor/Quiz/types.ts

export interface Quiz {
    id: number;
    title: string;
    description?: string;
    moduleId: number;
    moduleName: string;
    totalQuestions: number;
    timeLimit: number;
    attempts: number;
    averageScore: number;
    status: 'active' | 'draft';
    createdAt: string;
    hasAttempts: boolean;
}

export interface Module {
    id: number;
    title: string;
}

export interface Question {
    id?: number;
    question: string;
    type: 'multiple_choice';
    options: string[];
    correct_answer: string;
    points: number;
}

export interface QuizResult {
    id: number;
    studentName: string;
    nim: string;
    quizId: number;
    quizTitle: string;
    moduleTitle?: string;
    score: number;
    rawScore?: number;
    totalQuestions?: number;
    pointsEarned: number;
    completedAt: string;
    attemptNumber?: number;
    attempts?: number;
}

export interface QuizFormData {
    title: string;
    description: string;
    module_id: string;
    /** string agar input bisa dikosongkan sebelum diketik ulang */
    time_limit: number | string;
    questions: Question[];
}

export const EMPTY_QUESTION: Question = {
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: 'A',
    points: 10,
};

export const EMPTY_FORM: QuizFormData = {
    title: '',
    description: '',
    module_id: '',
    time_limit: '',
    questions: [],
};
