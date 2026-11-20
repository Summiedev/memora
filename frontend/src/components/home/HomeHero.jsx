import { ArrowUpRight, CalendarDays, Heart, LockKeyhole } from "lucide-react";
import memoryCard from "../../assets/memory-card.png";

const HomeHero = () => (
  <section className="home-hero" aria-labelledby="hero-title">
    <div className="home-hero__copy" data-reveal="hero">
      <h1 id="hero-title">Keep your memories<br />in one place.</h1>
      <p className="home-hero__lede">
        Write about your day, save photos, track your mood, or make a time capsule.
      </p>
      <div className="home-hero__actions">
        <a className="button button--primary" href="/register">
          Create account <ArrowUpRight size={18} aria-hidden="true" />
        </a>
        <a className="button button--quiet" href="#how-it-works">How it works</a>
      </div>
      <p className="home-hero__privacy">
        <LockKeyhole size={16} aria-hidden="true" />
        <span>Your private entries are only visible to you.</span>
      </p>
    </div>

    <div className="archive-window" aria-label="An example of a memory saved in Memora" data-reveal="hero">
      <div className="archive-window__bar">
        <span>Today</span>
        <span className="archive-window__status"><i aria-hidden="true" /> Saved</span>
      </div>
      <article className="memory-postcard">
        <div className="memory-postcard__photo">
          <img src={memoryCard} alt="Coffee, an open notebook, and flowers on a quiet morning" width="800" height="1000" />
          <span>09:16</span>
        </div>
        <div className="memory-postcard__content">
          <p className="memory-postcard__date"><CalendarDays size={15} aria-hidden="true" /> Thursday, November 20</p>
          <h2>Coffee before work.</h2>
          <p>A quiet start to the day.</p>
          <div className="memory-postcard__footer">
            <span><Heart size={15} fill="currentColor" aria-hidden="true" /> Grateful</span>
            <span>Diary entry</span>
          </div>
        </div>
      </article>
      <div className="archive-window__note archive-window__note--top"><span>Time capsule</span><strong>Opens Dec 2031</strong></div>
      <div className="archive-window__note archive-window__note--bottom"><span>This week</span><strong>4 new memories</strong></div>
    </div>
  </section>
);

export default HomeHero;
