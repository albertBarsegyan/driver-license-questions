import type { Route } from "./+types/home";
import { Link } from "react-router";
import { questions, sources } from "~/entities/driving-question/data";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Տեսական Քննություն" },
    {
      name: "description",
      content: "Հայկական վարորդական տեսության աղբյուրային հարցաշար",
    },
  ];
}

export default function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">ARMENIAN DRIVING THEORY</p>
      <h1>
        Պատրաստվեք՝
        <br />
        աղբյուրին հավատարիմ
      </h1>
      <p className="lede">
        PDF հարցաշարերի պահոց՝ հարցի, պատասխանի նշիչի, էջի և տեսողական
        համատեքստի հետ։
      </p>
      <div className="actions">
        <Link className="button" to="/quiz">
          Սկսել թեստը
        </Link>
        <Link className="button secondary" to="/questions">
          Ուսումնասիրել հարցերը
        </Link>
      </div>
      <div className="official-source">
        <strong>Պաշտոնական աղբյուր</strong>
        <p>
          Հարցերը անմիջականորեն արտածվել են ՀՀ ՆԳՆ Ոստիկանության պաշտոնական
          կայքում հրապարակված «Վարորդական տեսական քննության հարցաշարեր» հայերեն
          PDF հարցաշարերից։
        </p>
        <a
          href="https://roadpolice.am/hy/viv-exam"
          target="_blank"
          rel="noreferrer"
        >
          Բացել պաշտոնական հարցաշարերը ↗
        </a>
      </div>
      <div className="stats">
        <div>
          <strong>{questions.length}</strong>
          <span>աղբյուրային հարց</span>
        </div>
        <div>
          <strong>{sources.length}</strong>
          <span>PDF խումբ</span>
        </div>
        <div>
          <strong>186</strong>
          <span>PDF էջ</span>
        </div>
      </div>
    </section>
  );
}
