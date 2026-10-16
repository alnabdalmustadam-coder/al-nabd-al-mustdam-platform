export type StudentQuizQuestion = {
  id: string;
  text: string;
  options: string[];
  type?: 'matching';
  prompts?: string[];
};

export type QuizQuestionDefinition = StudentQuizQuestion & {
  correctIndex: number;
  correctIndices?: number[];
  explanation?: string;
};

export type StudentQuizAnswer = {
  questionId: string;
  selectedIndex: number;
  selectedIndices?: number[];
};

export type GradedQuizQuestion = StudentQuizQuestion & {
  selectedIndex: number | null;
  correctIndex: number;
  selectedIndices?: number[];
  correctIndices?: number[];
  isCorrect: boolean;
  explanation?: string;
};

export function sanitizeQuizAnswers(
  rawAnswers: unknown,
  questions: StudentQuizQuestion[],
): StudentQuizAnswer[] {
  if (!Array.isArray(rawAnswers)) return [];

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const answerMap = new Map<string, StudentQuizAnswer>();

  rawAnswers.slice(0, 200).forEach((rawAnswer) => {
    const answer = asRecord(rawAnswer);
    if (!answer) return;

    const questionId = cleanText(answer.questionId ?? answer.question_id ?? answer.id, 120);
    const question = questionMap.get(questionId);
    if (question?.type === 'matching') {
      const values = Array.isArray(answer.selectedIndices) ? answer.selectedIndices : [];
      const used = new Set<number>();
      const selectedIndices = (question.prompts || []).map((_, index) => {
        const selected = values[index];
        if (typeof selected !== 'number' || !Number.isInteger(selected)
          || selected < 0 || selected >= question.options.length || used.has(selected)) return -1;
        used.add(selected);
        return selected;
      });
      answerMap.set(questionId, { questionId, selectedIndex: -1, selectedIndices });
      return;
    }
    const rawIndex = answer.selectedIndex ?? answer.selected_index;
    const selectedIndex = typeof rawIndex === 'number' || (typeof rawIndex === 'string' && rawIndex.trim() !== '') ? Number(rawIndex) : NaN;
    if (
      question
      && Number.isInteger(selectedIndex)
      && selectedIndex >= 0
      && selectedIndex < question.options.length
    ) {
      answerMap.set(questionId, { questionId, selectedIndex });
    }
  });

  return [...answerMap.values()];
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
    if (candidate === null || candidate === undefined || candidate === '') continue;
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
    if (question.type === 'matching') {
      const rawPairs = Array.isArray(question.pairs) ? question.pairs : [];
      if (!text || rawPairs.length < 2 || rawPairs.length > 10) return;
      const pairs = rawPairs.map((rawPair) => {
        const pair = asRecord(rawPair);
        return { prompt: cleanText(pair?.prompt, 500), answer: cleanText(pair?.answer, 500) };
      });
      if (pairs.some((pair) => !pair.prompt || !pair.answer)
        || new Set(pairs.map((pair) => pair.answer)).size !== pairs.length) return;
      // Answer labels are sorted independently of the prompt order. The private
      // mapping never leaves the server before the attempt is submitted.
      const options = pairs.map((pair) => pair.answer).sort((a, b) => a.localeCompare(b, 'ar'));
      const requestedId = cleanText(question.id, 120) || `question-${index + 1}`;
      const id = usedIds.has(requestedId) ? `${requestedId}-${index + 1}` : requestedId;
      usedIds.add(id);
      const explanation = cleanText(question.explanation, 3000);
      questions.push({ id, text, type: 'matching', prompts: pairs.map((pair) => pair.prompt),
        options, correctIndex: -1, correctIndices: pairs.map((pair) => options.indexOf(pair.answer)),
        ...(explanation ? { explanation } : {}) });
      return;
    }
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
  return questions.map(({ id, text, options, type, prompts }) => ({ id, text, options,
    ...(type === 'matching' ? { type, prompts } : {}) }));
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
      .map((answer) => [answer.questionId, answer]),
  );

  let correctAnswers = 0;
  const results = questions.map((question) => {
    const candidate = answerMap.get(question.id);
    if (question.type === 'matching') {
      const selectedIndices = candidate?.selectedIndices || (question.prompts || []).map(() => -1);
      const correctIndices = question.correctIndices || [];
      const isCorrect = correctIndices.length > 0 && correctIndices.every((value, index) => selectedIndices[index] === value);
      if (isCorrect) correctAnswers += 1;
      return { ...question, selectedIndex: null, selectedIndices, correctIndices, isCorrect };
    }
    const selectedIndex =
      candidate !== undefined && candidate.selectedIndex >= 0 && candidate.selectedIndex < question.options.length
        ? candidate.selectedIndex
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

export function isQuizAnswerComplete(question: StudentQuizQuestion, answer?: StudentQuizAnswer): boolean {
  if (!answer) return false;
  if (question.type === 'matching') {
    const values = answer.selectedIndices || [];
    return values.length === question.prompts?.length && new Set(values).size === values.length
      && values.every((value) => Number.isInteger(value) && value >= 0 && value < question.options.length);
  }
  return Number.isInteger(answer.selectedIndex) && answer.selectedIndex >= 0 && answer.selectedIndex < question.options.length;
}
