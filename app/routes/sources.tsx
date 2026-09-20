import { Link } from "react-router";
import { sources, questions } from "~/entities/driving-question/data";
export default function Sources() { return <section><p className="eyebrow">PDF ԱՂԲՅՈՒՐՆԵՐ</p><h1>Հարցաշարեր</h1><div className="grid">{sources.map((source) => <Link className="tile" key={source} to={`/sources/${encodeURIComponent(source)}`}><strong>{source}</strong><span>{questions.filter((q) => q.source.file === source).length} հարց</span></Link>)}</div></section> }
