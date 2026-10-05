import { Link } from "react-router";

export function AppFooter() {
  return (
    <footer className="footer">
      <Link className="brand" to="/">
        <img
          className="brand-logo"
          src="/favicon/logo-96.png"
          alt=""
          width={36}
          height={36}
          loading="lazy"
        />
        Տեսական Քննություն
      </Link>
      <p>Հայկական վարորդական տեսության աղբյուրային հարցաշար</p>
      <p className="footer-credit">
        Website made by{" "}
        <a
          href="https://neolabsagency.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Neo Labs Agency
        </a>{" "}
        — let's build something amazing together.
      </p>
    </footer>
  );
}
