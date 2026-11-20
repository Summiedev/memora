import { ArrowUpRight, Heart } from "lucide-react";

const BeginSection = () => (
  <section className="home-section home-section--begin" aria-labelledby="begin-title">
    <div className="begin-panel" data-reveal="section">
      <div className="begin-panel__stamp" aria-hidden="true"><Heart size={26} fill="currentColor" /></div>
      <h2 id="begin-title">Start your journal today.</h2>
      <p>Create an account and save your first memory.</p>
      <a className="button button--light" href="/register">Create account <ArrowUpRight size={18} aria-hidden="true" /></a>
    </div>

    <footer className="home-footer">
      <a className="home-footer__brand" href="/" aria-label="Memora home"><img src="/memora-icon.svg" alt="" aria-hidden="true" /> <span>Memora</span></a>
      <p>Keep the moments you care about.</p>
      <div><a href="/login">Sign in</a><a href="/register">Create an account</a></div>
    </footer>
  </section>
);

export default BeginSection;
