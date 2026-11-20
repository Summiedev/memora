import { Menu, X } from "lucide-react";
import { useState } from "react";
import PwaControls from "../PwaControls";

const navItems = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#inside", label: "Inside Memora" },
  { href: "#shared", label: "Share a memory" },
];

const HomeNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="home-nav">
      <a className="home-nav__brand" href="/" aria-label="Memora home">
        <img src="/memora-icon.svg" alt="" aria-hidden="true" />
        <span>Memora</span>
      </a>

      <nav className="home-nav__links" aria-label="Landing page">
        {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>

      <div className="home-nav__actions">
        <PwaControls />
        <a className="home-nav__signin" href="/login">Sign in</a>
        <a className="button button--primary home-nav__join" href="/register">Create account</a>
        <button
          type="button"
          className="home-nav__menu"
          aria-expanded={menuOpen}
          aria-controls="home-mobile-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <nav id="home-mobile-navigation" className="home-nav__mobile" aria-label="Landing page mobile">
          {navItems.map((item) => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>)}
          <a href="/login" onClick={closeMenu}>Sign in</a>
          <a className="button button--primary" href="/register" onClick={closeMenu}>Create account</a>
        </nav>
      )}
    </header>
  );
};

export default HomeNav;
