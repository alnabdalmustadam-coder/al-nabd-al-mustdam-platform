export type StudentQuizQuestion = {
  id: string;
  text: string;
  options: string[];
};

export type QuizQuestionDefinition = StudentQuizQuestion & {
  correctIndex: number;
  explanation?: string;
};

export type StudentQuizAnswer = {
  questionId: string;
  selectedIndex: number;
};

export type GradedQuizQuestion = StudentQuizQuestion & {
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation?: string;
};

export function sanitizeQuizAnswers(
  rawAnswers: unknown,
  questions: StudentQuizQuestion[],
): StudentQuizAnswer[] {
  if (!Array.isArray(rawAnswers)) return [];

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const answerMap = new Map<string, number>();

  rawAnswers.slice(0, 200).forEach((rawAnswer) => {
    const answer = asRecord(rawAnswer);
    if (!answer) return;

    const questionId = cleanText(answer.questionId ?? answer.question_id ?? answer.id, 120);
    const selectedIndex = Number(answer.selectedIndex ?? answer.selected_index);
    const question = questionMap.get(questionId);
    if (
      question
      && Number.isInteger(selectedIndex)
      && selectedIndex >= 0
      && selectedIndex < question.options.length
    ) {
      answerMap.set(questionId, selectedIndex);
    }
  });

  return [...answerMap].map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function resolveCorrectIndex(question: UnknownRecord, options: string[]): number | null {
  const numericCandidates = [
    question.correctIndex,
    question.correct_index,
    question.correctOptionIndex,
    question.correct_option_index,
  ];

  for (const candidate of numericCandidates) {
    const parsed = Number(candidate);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < options.length) {
      return parsed;
    }
  }

  const correctAnswer = cleanText(question.correctAnswer ?? question.correct_answer, 500);
  if (correctAnswer) {
    const index = options.findIndex((option) => option === correctAnswer);
    return index >= 0 ? index : null;
  }

  return null;
}

export function parseQuizQuestions(value: unknown): QuizQuestionDefinition[] {
  if (!Array.isArray(value)) return [];

  const usedIds = new Set<string>();
  const questions: QuizQuestionDefinition[] = [];

  value.slice(0, 200).forEach((rawQuestion, index) => {
    const question = asRecord(rawQuestion);
    if (!question) return;

    const text = cleanText(question.text ?? question.question ?? question.question_ar, 2000);
    const rawOptions = Array.isArray(question.options)
      ? question.options
      : Array.isArray(question.options_json)
        ? question.options_json
        : [];
    const options = rawOptions
      .slice(0, 10)
      .map((option) => cleanText(option, 500))
      .filter(Boolean);
    const correctIndex = resolveCorrectIndex(question, options);

    if (!text || options.length < 2 || correctIndex === null) return;

    const requestedId = cleanText(question.id, 120) || `question-${index + 1}`;
    const id = usedIds.has(requestedId) ? `${requestedId}-${index + 1}` : requestedId;
    usedIds.add(id);

    const explanation = cleanText(question.explanation, 3000);
    questions.push({
      id,
      text,
      options,
      correctIndex,
      ...(explanation ? { explanation } : {}),
    });
  });

  return questions;
}

export function toStudentQuizQuestions(
  questions: QuizQuestionDefinition[],
): StudentQuizQuestion[] {
  return questions.map(({ id, text, options }) => ({ id, text, options }));
}

export function gradeQuizAnswers(
  questions: QuizQuestionDefinition[],
  rawAnswers: unknown,
): {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  results: GradedQuizQuestion[];
} {
  const answerMap = new Map(
    sanitizeQuizAnswers(rawAnswers, questions)
      .map((answer) => [answer.questionId, answer.selectedIndex]),
  );

  let correctAnswers = 0;
  const results = questions.map((question) => {
    const candidate = answerMap.get(question.id);
    const selectedIndex =
      candidate !== undefined && candidate >= 0 && candidate < question.options.length
        ? candidate
        : null;
    const isCorrect = selectedIndex === question.correctIndex;
    if (isCorrect) correctAnswers += 1;

    return {
      id: question.id,
      text: question.text,
      options: question.options,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      ...(question.explanation ? { explanation: question.explanation } : {}),
    };
  });

  const totalQuestions = questions.length;
  const score = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 10000) / 100
    : 0;

  return { score, totalQuestions, correctAnswers, results };
}
