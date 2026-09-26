import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";

export function AppHeader() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    setDark(
      saved
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="header">
      <Link className="brand" to="/">
        Տեսական Քննություն
      </Link>
      <nav
        className={`mobile-nav ${menuOpen ? "open" : ""}`}
        aria-label="Գլխավոր նավարկում"
      >
        <NavLink onClick={() => setMenuOpen(false)} to="/questions">
          Հարցեր
        </NavLink>
        <NavLink onClick={() => setMenuOpen(false)} to="/categories">
          Կատեգորիաներ
        </NavLink>
        <NavLink onClick={() => setMenuOpen(false)} to="/sources">
          Աղբյուրներ
        </NavLink>
        <NavLink onClick={() => setMenuOpen(false)} to="/quiz">
          Թեստ
        </NavLink>
      </nav>
      <button
        className="mobile-menu-toggle"
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        aria-label={menuOpen ? "Փակել ընտրացանկը" : "Բացել ընտրացանկը"}
        aria-expanded={menuOpen}
      >
        ☰
      </button>
      <button
        className="theme-toggle"
        type="button"
        onClick={() => setDark((current) => !current)}
        aria-label={dark ? "Միացնել լուսավոր տեսքը" : "Միացնել մութ տեսքը"}
        title={dark ? "Լուսավոր տեսք" : "Մութ տեսք"}
      >
        {dark ? "☀" : "☾"}
      </button>
    </header>
  );
}
