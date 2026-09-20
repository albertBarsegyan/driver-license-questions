import { Link } from "react-router";
import type { Route } from "./+types/category";
import { questions } from "~/entities/driving-question/data";
export default function Category({ params }: Route.ComponentProps) { const category = decodeURIComponent(params.category); const list = questions.filter(q => q.categories.includes(category)); return <section><Link to="/categories">← Կատեգորիաներ</Link><h1>{category}</h1><p className="lede">{list.length} հարց</p><Link className="button" to={`/quiz?category=${encodeURIComponent(category)}`}>Սկսել թեստը</Link><div className="question-list">{list.map(q => <Link key={q.id} to={`/questions/${q.id}`}>{q.question}<small>{q.source.file} · էջ {q.source.page}</small></Link>)}</div></section> }
