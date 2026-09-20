import type { SourceQuestion } from "~/entities/driving-question/model/types";

export function SourceLine({ question }: { question: SourceQuestion }) {
  return <p className="source-line">Աղբյուր՝ {question.source.file} · էջ {question.source.page} · հարց {question.source.questionIndex}</p>;
}

export function QuestionVisual({ question }: { question: SourceQuestion }) {
  if (!question.visual) return null;
  const extracted = question.visual.type === "image";
  return <figure className="visual"><img src={question.visual.src} alt={extracted ? `Հարցի բնօրինակ պատկեր՝ էջ ${question.visual.page}` : `Աղբյուրի էջ ${question.visual.page}`} loading="lazy" /><figcaption>{extracted ? `PDF-ից արտածված բնօրինակ պատկեր · էջ ${question.visual.page}` : `Աղբյուրի էջ ${question.visual.page}. Նկարը ցուցադրված է ամբողջական համատեքստով։`}</figcaption></figure>;
}
