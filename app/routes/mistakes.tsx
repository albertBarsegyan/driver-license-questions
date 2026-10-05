import { useEffect, useState } from "react";
import { Link } from "react-router";
import { questions } from "~/entities/driving-question/data";
import { getTestResults, type TestResult } from "~/lib/test-results";
import { QuestionVisual } from "~/widgets/question-card/question-card";
import { pageTitle } from "~/lib/utils";

const questionsById = new Map(
  questions.map((question) => [question.id, question]),
);

// testId looks like "format=v2&source=…&category=…:test-3".
function parseTestId(result: TestResult) {
  const separator = result.testId.lastIndexOf(":test-");
  const params = new URLSearchParams(result.testId.slice(0, separator));
  const number =
    result.testNumber ?? Number(result.testId.slice(separator + 6));
  const source = params.get("source");
  const category = params.get("category");
  const quizParams = new URLSearchParams();
  if (source && source !== "all") quizParams.set("source", source);
  if (category && category !== "all") quizParams.set("category", category);
  quizParams.set("test", String(number));
  return {
    number,
    scope: [
      source && source !== "all" ? source : null,
      category && category !== "all" ? category : null,
    ]
      .filter(Boolean)
      .join(" · "),
    url: `/quiz?${quizParams}`,
  };
}

export function meta() {
  return [{ title: pageTitle("Սխալ պատասխաններ") }];
}

export default function Mistakes() {
  const [results, setResults] = useState<TestResult[] | null>(null);

  useEffect(() => {
    getTestResults()
      .then((all) =>
        setResults(
          Object.values(all)
            .filter((result) => result.mistakes?.length)
            .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
        ),
      )
      .catch(() => setResults([]));
  }, []);

  return (
    <section>
      <Link className="back-link" to="/quiz">
        ← Բոլոր թեստերը
      </Link>
      <p className="eyebrow">ԹԵՍՏԵՐ</p>
      <h1>Սխալ պատասխաններ</h1>
      <p className="lede">
        Յուրաքանչյուր թեստի վերջին փորձի սխալ պատասխանները։ Ձեր պատասխանը նշված
        է կարմիրով, ճիշտ պատասխանը՝ կանաչով։
      </p>
      {results === null ? (
        <p>Բեռնվում է…</p>
      ) : !results.length ? (
        <p>Սխալ պատասխաններ դեռ չկան։</p>
      ) : (
        results.map((result) => {
          const test = parseTestId(result);
          return (
            <article className="mistake-test" key={result.testId}>
              <header className="mistake-test-header">
                <h2>
                  Թեստ {test.number}
                  {test.scope && <small> · {test.scope}</small>}
                </h2>
                <small>
                  {result.wrong} սխալ ·{" "}
                  {new Date(result.completedAt).toLocaleString("hy-AM")} ·{" "}
                  <Link to={test.url}>Կրկին փորձել</Link>
                </small>
              </header>
              {result.mistakes!.map((mistake, index) => {
                const question = questionsById.get(mistake.questionId);
                if (!question) return null;
                return (
                  <div
                    className="mistake"
                    key={`${mistake.questionId}-${index}`}
                  >
                    <h3>{question.question}</h3>
                    <QuestionVisual question={question} />
                    {question.originalOptions.map((option) => {
                      const correct =
                        option.sourceIndex ===
                        question.sourceCorrectOptionIndex;
                      const selected = option.id === mistake.selectedOptionId;
                      return (
                        <div
                          className={`answer ${correct ? "correct" : ""} ${selected && !correct ? "incorrect" : ""}`}
                          key={option.id}
                        >
                          <span>{option.text}</span>
                          {correct && <b>✓ Ճիշտ</b>}
                          {selected && !correct && <b>✕ Ձեր պատասխանը</b>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </article>
          );
        })
      )}
    </section>
  );
}
