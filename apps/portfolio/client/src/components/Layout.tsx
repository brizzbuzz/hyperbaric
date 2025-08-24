import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            Portfolio
          </Link>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className={`nav-link ${location.pathname.startsWith("/blog") ? "active" : ""}`}
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">{children}</main>

      <footer
        className="nav"
        style={{
          borderTop: "1px solid var(--ui-color-border, #e5e7eb)",
          borderBottom: "none",
        }}
      >
        <div className="nav-container">
          <p
            style={{
              color: "var(--ui-color-text-secondary, #4a4a4a)",
              fontSize: "0.875rem",
            }}
          >
            © 2024 Portfolio. Built with React + Vite + MDX.
          </p>
        </div>
      </footer>
    </div>
  );
}
