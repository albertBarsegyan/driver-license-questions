import { Link } from "react-router";
import { categories, questions } from "~/entities/driving-question/data";
import { pageTitle } from "~/lib/utils";
export function meta() {
  return [{ title: pageTitle("Կատեգորիաներ") }];
}

export default function Categories() {
  return (
    <section>
      <p className="eyebrow">ԹԵՄԱՆԵՐ</p>
      <h1>Կատեգորիաներ</h1>
      <div className="grid">
        {categories.map((category) => (
          <Link
            className="tile"
            key={category}
            to={`/categories/${encodeURIComponent(category)}`}
          >
            <strong>{category}</strong>
            <span>
              {questions.filter((q) => q.categories.includes(category)).length}{" "}
              հարց
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
