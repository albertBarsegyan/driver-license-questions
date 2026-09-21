import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { questions } from "~/entities/driving-question/data";
import { getTestResults, saveTestResult, type TestResult } from "~/lib/test-results";
import { QuestionVisual } from "~/widgets/question-card/question-card";

const QUESTIONS_PER_TEST = 20;
type QuizItem = { source: (typeof questions)[number]; quiz: { questionId: string; question: string; options: (typeof questions)[number]["originalOptions"]; correctOptionId: string; source: (typeof questions)[number]["source"]; visual?: (typeof questions)[number]["visual"] } };
type TestGroup = { id: string; number: number; items: QuizItem[] };

function listUrl(source: string | null, category: string | null) {
  const params = new URLSearchParams();
  if (source) params.set("source", source);
  if (category) params.set("category", category);
  return `/quiz${params.size ? `?${params}` : ""}`;
}

export default function Quiz() {
  const [search] = useSearchParams();
  const source = search.get("source");
  const category = search.get("category");
  const selectedTest = Number(search.get("test"));
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const tests = useMemo<TestGroup[]>(() => {
    const scope = `source=${source ?? "all"}&category=${category ?? "all"}`;
    const items = questions
      .filter((question) => (!source || question.source.file === source) && (!category || question.categories.includes(category)))
      .map((sourceQuestion): QuizItem => ({
        source: sourceQuestion,
        quiz: {
          questionId: sourceQuestion.id,
          question: sourceQuestion.question,
          options: sourceQuestion.originalOptions,
          correctOptionId: sourceQuestion.originalOptions.find((option) => option.sourceIndex === sourceQuestion.sourceCorrectOptionIndex)?.id ?? "",
          source: sourceQuestion.source,
          visual: sourceQuestion.visual,
        },
      }));
    return Array.from({ length: Math.ceil(items.length / QUESTIONS_PER_TEST) }, (_, index) => ({ id: `${scope}:test-${index + 1}`, number: index + 1, items: items.slice(index * QUESTIONS_PER_TEST, (index + 1) * QUESTIONS_PER_TEST) }));
  }, [source, category]);

  useEffect(() => { getTestResults().then(setResults).catch(() => setResults({})).finally(() => setResultsLoaded(true)); }, []);
  const test = tests.find((item) => item.number === selectedTest);
  if (!Number.isInteger(selectedTest) || selectedTest < 1 || !test) return <TestList tests={tests} results={results} resultsLoaded={resultsLoaded} source={source} category={category} />;
  return <TestRunner key={`${test.id}:${search.get("attempt") ?? "0"}`} test={test} source={source} category={category} onComplete={(result) => setResults((current) => ({ ...current, [result.testId]: result }))} />;
}

function TestList({ tests, results, resultsLoaded, source, category }: { tests: TestGroup[]; results: Record<string, TestResult>; resultsLoaded: boolean; source: string | null; category: string | null }) {
  if (!tests.length) return <section><h1>Թեստի հարցեր չկան</h1><p className="lede">Այս ընտրության մեջ հարցեր չկան։</p><Link className="button" to="/questions">Բացել արխիվը</Link></section>;
  const testUrl = (number: number) => `${listUrl(source, category)}${listUrl(source, category).includes("?") ? "&" : "?"}test=${number}`;
  return <section className="test-list"><p className="eyebrow">ԹԵՍՏԵՐ</p><h1>Ընտրեք թեստ</h1><p className="lede">Բոլոր {tests.reduce((total, test) => total + test.items.length, 0)} հարցերը բաժանված են մինչև 20 հարց ունեցող թեստերի։ 2-ից ավելի սխալի դեպքում թեստը չի ընդունվում։</p><div className="test-grid">{tests.map((test) => { const result = results[test.id]; const status = !result ? "Չսկսված" : result.passed ? "Անցած" : "Չընդունված"; return <Link className={`test-tile ${result ? (result.passed ? "passed" : "rejected") : "idle"}`} key={test.id} to={testUrl(test.number)}><span>ԹԵՍՏ {test.number}</span><strong>{test.items.length} հարց</strong><small>{resultsLoaded ? status : "Բեռնվում է…"}</small>{result && <em>{result.correct} ճիշտ · {result.wrong} սխալ</em>}</Link>; })}</div></section>;
}

function TestRunner({ test, source, category, onComplete }: { test: TestGroup; source: string | null; category: string | null; onComplete: (result: TestResult) => void }) {
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState<string | null>(null); const [submitted, setSubmitted] = useState(false); const [correctCount, setCorrectCount] = useState(0); const [wrongCount, setWrongCount] = useState(0); const [savedResult, setSavedResult] = useState<TestResult | null>(null);
  const item = test.items[index]; const correct = selected === item.quiz.correctOptionId; const backUrl = listUrl(source, category);
  function answer(optionId: string) {
    if (submitted) return;
    const isCorrect = optionId === item.quiz.correctOptionId;
    setSelected(optionId);
    setSubmitted(true);
    if (isCorrect) setCorrectCount((count) => count + 1); else setWrongCount((count) => count + 1);
    window.setTimeout(() => {
      if (index + 1 === test.items.length) {
        const result = { testId: test.id, correct: correctCount + Number(isCorrect), wrong: wrongCount + Number(!isCorrect), passed: wrongCount + Number(!isCorrect) <= 2, completedAt: new Date().toISOString() };
        setSavedResult(result); onComplete(result); void saveTestResult(result); return;
      }
      setIndex((current) => current + 1); setSelected(null); setSubmitted(false);
    }, 700);
  }
  if (savedResult) return <section className="result"><p className="eyebrow">ԱՐԴՅՈՒՆՔ · ԹԵՍՏ {test.number}</p><h1 className={savedResult.passed ? "result-pass" : "result-reject"}>{savedResult.passed ? "Անցաք թեստը" : "Թեստը չի ընդունվել"}</h1><div className="result-counts"><div><strong>{savedResult.correct}</strong><span>ճիշտ</span></div><div><strong>{savedResult.wrong}</strong><span>սխալ</span></div></div><p>{savedResult.passed ? "Թույլատրվում է առավելագույնը 2 սխալ։ Արդյունքը պահվել է այս սարքում։" : "2-ից ավելի սխալ կա։ Արդյունքը պահվել է այս սարքում, և կարող եք փորձել կրկին։"}</p><div className="actions"><Link className="button" to={backUrl}>Բոլոր թեստերը</Link><Link className="button secondary" to={`${backUrl}${backUrl.includes("?") ? "&" : "?"}test=${test.number}&attempt=${Date.now()}`}>Կրկին փորձել</Link></div></section>;
  return <section className="quiz"><Link className="back-link" to={backUrl}>← Բոլոր թեստերը</Link><p className="eyebrow">ԹԵՍՏ {test.number} · ՀԱՐՑ {index + 1} / {test.items.length}</p><div className="progress"><span style={{ width: `${((index + 1) / test.items.length) * 100}%` }} /></div><h1>{item.quiz.question}</h1><QuestionVisual question={item.source} /><fieldset disabled={submitted}><legend className="sr-only">Պատասխանի տարբերակներ</legend>{item.quiz.options.map((option) => <label className={`answer ${submitted && option.id === item.quiz.correctOptionId ? "correct" : ""} ${submitted && selected === option.id && option.id !== item.quiz.correctOptionId ? "incorrect" : ""}`} key={option.id}><input type="radio" name="answer" checked={selected === option.id} onChange={() => answer(option.id)} /><span>{option.text}</span></label>)}</fieldset>{submitted && <div className="feedback"><strong>{correct ? "✓ Ճիշտ է" : "✕ Սխալ է"}</strong><p>Ճիշտ պատասխան՝ {item.quiz.options.find((option) => option.id === item.quiz.correctOptionId)?.text}</p><small>Հաջորդ հարցը բեռնվում է…</small></div>}</section>;
}
