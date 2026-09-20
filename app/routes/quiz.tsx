import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { questions } from "~/entities/driving-question/data";
import { buildQuizQuestion, shuffle } from "~/entities/driving-question/lib/quiz";
import { QuestionVisual } from "~/widgets/question-card/question-card";

export default function Quiz() {
  const [search] = useSearchParams(); const source = search.get("source"); const category = search.get("category");
  const list = useMemo(() => shuffle(questions.filter(q => (!source || q.source.file === source) && (!category || q.categories.includes(category)) && !q.needsReview && q.originalOptions.length === 4)).slice(0, 20).map(q => ({ source: q, quiz: buildQuizQuestion(q)! })), [source, category]);
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState<string | null>(null); const [submitted, setSubmitted] = useState(false); const [score, setScore] = useState(0);
  const item = list[index];
  if (!item) return <section><h1>Անհրաժեշտ է ձեռքով վերանայել</h1><p>Այս ընտրության մեջ չկան ամբողջական, 4 աղբյուրային տարբերակ ունեցող հարցեր։ Աղբյուրային տվյալները չեն լրացվել ենթադրությամբ։</p><Link className="button" to="/questions">Բացել արխիվը</Link></section>;
  const correct = selected === item.quiz.correctOptionId;
  function submit() { if (!selected || submitted) return; if (correct) setScore(s => s + 1); setSubmitted(true); }
  function next() { if (index === list.length - 1) { setIndex(list.length); return; } setIndex(i => i + 1); setSelected(null); setSubmitted(false); }
  if (index >= list.length) return <section className="result"><p className="eyebrow">ԱՐԴՅՈՒՆՔ</p><h1>{score} / {list.length}</h1><p>Հաշվարկվել են միայն PDF-ում չորս հստակ աղբյուրային տարբերակ ունեցող հարցեր։</p><Link className="button" to="/quiz">Նոր թեստ</Link></section>;
  return <section className="quiz"><p className="eyebrow">ՀԱՐՑ {index + 1} / {list.length}</p><div className="progress"><span style={{ width: `${((index + 1) / list.length) * 100}%` }}/></div><h1>{item.quiz.question}</h1><QuestionVisual question={item.source}/><fieldset disabled={submitted}><legend className="sr-only">Պատասխանի տարբերակներ</legend>{item.quiz.options.map(option => <label className={`answer ${submitted && option.id === item.quiz.correctOptionId ? "correct" : ""} ${submitted && selected === option.id && option.id !== item.quiz.correctOptionId ? "incorrect" : ""}`} key={option.id}><input type="radio" name="answer" checked={selected === option.id} onChange={() => setSelected(option.id)}/><span>{option.text}</span></label>)}</fieldset>{submitted ? <div className="feedback"><strong>{correct ? "✓ Ճիշտ է" : "✕ Սխալ է"}</strong><p>Ճիշտ պատասխան՝ {item.quiz.options.find(o => o.id === item.quiz.correctOptionId)?.text}</p><button onClick={next}>{index + 1 === list.length ? "Արդյունք" : "Հաջորդ հարց"}</button></div> : <button disabled={!selected} onClick={submit}>Պատասխանել</button>}</section>;
}
