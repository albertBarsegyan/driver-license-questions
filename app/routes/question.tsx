import { Link } from "react-router";
import type { Route } from "./+types/question";
import { getQuestion } from "~/entities/driving-question/data";
import { QuestionVisual, SourceLine } from "~/widgets/question-card/question-card";
export default function QuestionPage({ params }: Route.ComponentProps) { const q = getQuestion(params.questionId); if (!q) return <p>Հարցը չի գտնվել։</p>; return <article className="study-card"><Link to="/questions">← Բոլոր հարցերը</Link><p className="eyebrow">{q.categories.join(" · ")}</p><h1>{q.question}</h1><QuestionVisual question={q}/><ol className="source-options">{q.originalOptions.map((o) => <li key={o.id}>{o.text}</li>)}</ol>{q.needsReview && <aside className="notice">Այս գրառումը նշված է ստուգման համար. {q.reviewReasons?.join(", ")}</aside>}<SourceLine question={q}/></article> }
