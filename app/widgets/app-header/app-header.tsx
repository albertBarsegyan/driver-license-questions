import { Link, NavLink } from "react-router";
export function AppHeader() {
  return <header className="header"><Link className="brand" to="/">Վարորդի տեսություն</Link><nav aria-label="Գլխավոր նավարկում"><NavLink to="/questions">Հարցեր</NavLink><NavLink to="/categories">Կատեգորիաներ</NavLink><NavLink to="/sources">Աղբյուրներ</NavLink><NavLink to="/quiz">Թեստ</NavLink></nav></header>;
}
