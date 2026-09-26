import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/question";
import { getQuestion, questions } from "~/entities/driving-question/data";
import {
  QuestionVisual,
  SourceLine,
} from "~/widgets/question-card/question-card";
export default function QuestionPage({ params }: Route.ComponentProps) {
  const q = getQuestion(params.questionId);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
  }, [q?.id]);
  if (!q) return <p>Հարցը չի գտնվել։</p>;

  const category = search.get("category");
  const categoryQuestions = category
    ? questions.filter((question) => question.categories.includes(category))
    : [];
  const currentIndex = categoryQuestions.findIndex(
    (question) => question.id === q.id,
  );
  const nextQuestion =
    currentIndex >= 0 ? categoryQuestions[currentIndex + 1] : undefined;
  const correctOption = q.originalOptions.find(
    (option) => option.sourceIndex === q.sourceCorrectOptionIndex,
  );
  const isCorrect = selected === correctOption?.id;
  const backUrl = category
    ? `/categories/${encodeURIComponent(category)}`
    : "/questions";
  function answer(optionId: string) {
    if (submitted) return;
    setSelected(optionId);
    setSubmitted(true);
    if (nextQuestion) {
      window.setTimeout(
        () =>
          navigate(
            `/questions/${nextQuestion.id}?category=${encodeURIComponent(category!)}`,
          ),
        1200,
      );
    }
  }

  return (
    <article className="study-card question-page">
      <Link to={backUrl}>← {category ? "Կատեգորիա" : "Բոլոր հարցերը"}</Link>
      <p className="eyebrow">{q.categories.join(" · ")}</p>
      <h1>{q.question}</h1>
      <QuestionVisual question={q} />
      <fieldset disabled={submitted}>
        <legend className="sr-only">Պատասխանի տարբերակներ</legend>
        {q.originalOptions.map((option) => (
          <label
            className={`answer ${submitted && option.id === correctOption?.id ? "correct" : ""} ${submitted && selected === option.id && !isCorrect ? "incorrect" : ""}`}
            key={option.id}
          >
            <input
              type="radio"
              name="answer"
              checked={selected === option.id}
              onChange={() => answer(option.id)}
            />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      {submitted && (
        <div className="feedback">
          <strong>{isCorrect ? "✓ Ճիշտ է" : "✕ Սխալ է"}</strong>
          <p>Ճիշտ պատասխան՝ {correctOption?.text}</p>
          {nextQuestion ? (
            <small>Հաջորդ հարցը բեռնվում է…</small>
          ) : category ? (
            <Link className="button" to={backUrl}>
              Վերադառնալ կատեգորիային
            </Link>
          ) : null}
        </div>
      )}
      {q.needsReview && (
        <aside className="notice">
          Այս գրառումը նշված է ստուգման համար. {q.reviewReasons?.join(", ")}
        </aside>
      )}
      <SourceLine question={q} />
    </article>
  );
}
