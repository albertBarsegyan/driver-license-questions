import { Link } from "react-router";
import type { Route } from "./+types/category";
import { questions } from "~/entities/driving-question/data";

export default function Category({ params }: Route.ComponentProps) {
  const category = decodeURIComponent(params.category);
  const list = questions.filter((question) => question.categories.includes(category));

  return <section>
    <Link to="/categories">← Կատեգորիաներ</Link>
    <h1>{category}</h1>
    <p className="lede">{list.length} հարց</p>
    <Link className="button" to={`/quiz?category=${encodeURIComponent(category)}`}>Սկսել թեստը</Link>
    <div className="question-list category-question-list">
      {list.map((question) => {
        return <article className="category-question" key={question.id}>
          <Link to={`/questions/${question.id}?category=${encodeURIComponent(category)}`}>{question.question}</Link>
          <small>{question.source.file} · էջ {question.source.page}</small>
        </article>;
      })}
    </div>
  </section>;
}
