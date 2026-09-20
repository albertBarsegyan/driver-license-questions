import { Link } from "react-router";
import type { Route } from "./+types/source";
import { questions } from "~/entities/driving-question/data";
export default function Source({ params }: Route.ComponentProps) { const source = decodeURIComponent(params.sourceId); const list = questions.filter(q => q.source.file === source); return <section><Link to="/sources">← Աղբյուրներ</Link><h1>{source}</h1><p className="lede">{list.length} պահպանված հարց</p><Link className="button" to={`/quiz?source=${encodeURIComponent(source)}`}>Սկսել 4-տարբերակով թեստը</Link><div className="question-list">{list.map(q => <Link key={q.id} to={`/questions/${q.id}`}>{q.question}<small>Էջ {q.source.page}</small></Link>)}</div></section> }
