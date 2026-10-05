import { Link } from "react-router";
import { questions } from "~/entities/driving-question/data";
import { pageTitle } from "~/lib/utils";
export function meta() {
  return [{ title: pageTitle("Բոլոր հարցերը") }];
}

export default function Questions() {
  return (
    <section>
      <p className="eyebrow">ԱՐԽԻՎ</p>
      <h1>Բոլոր աղբյուրային հարցերը</h1>
      <p className="lede">
        {questions.length} հարց՝ պահպանված PDF-ի էջային հղումներով։
      </p>
      <div className="question-list">
        {questions.map((q) => (
          <Link key={q.id} to={`/questions/${q.id}`}>
            <span>{q.question}</span>
            <small>
              {q.source.file} · էջ {q.source.page}
              {q.needsReview ? " · ստուգում է պահանջվում" : ""}
            </small>
          </Link>
        ))}
      </div>
    </section>
  );
}
