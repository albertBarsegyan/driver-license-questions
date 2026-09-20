export type SourceOption = { id: string; sourceIndex: number; text: string; generated: false };
export type SourceQuestion = {
  id: string; question: string; originalOptions: SourceOption[]; sourceCorrectOptionIndex: number;
  source: { file: string; page: number; questionIndex: number };
  categories: string[]; visual?: { type: "image" | "page"; src: string; page: number };
  duplicateGroupId?: string; needsReview?: boolean; reviewReasons?: string[];
};
export type QuizQuestion = { questionId: string; question: string; options: SourceOption[]; correctOptionId: string; source: SourceQuestion["source"]; visual?: SourceQuestion["visual"] };
