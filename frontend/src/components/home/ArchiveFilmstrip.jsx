import { BookOpenText, CalendarHeart, Image, LockKeyhole } from "lucide-react";
import { createElement } from "react";

const archiveItems = [
  { icon: BookOpenText, title: "Journal entries", text: "Keep quick notes, longer thoughts, and the details from your day." },
  { icon: Image, title: "Photo albums", text: "Save photos with the notes that go with them." },
  { icon: CalendarHeart, title: "Mood tracker", text: "Look back at how each day felt." },
];

const ArchiveFilmstrip = () => (
  <section id="inside" className="home-section home-section--archive" aria-labelledby="archive-title">
    <div className="section-heading section-heading--archive">
      <h2 id="archive-title">Everything is easy to find.</h2>
      <p>Your notes, photos, mood logs, and time capsules are organised by date.</p>
    </div>

    <div className="archive-layout" data-reveal="section">
      <div className="archive-browser" aria-label="Example archive timeline" role="img">
        <div className="archive-browser__topline"><span>MEMORA / TIMELINE</span><span>2026</span></div>
        <div className="archive-browser__main">
          <p className="archive-browser__month">November</p><div className="archive-browser__line" />
          <article className="archive-browser__entry"><span className="archive-browser__date">20</span><div><strong>Coffee before work</strong><p>Journal entry</p></div></article>
          <article className="archive-browser__entry archive-browser__entry--photo"><span className="archive-browser__date">18</span><div><strong>Balcony sunset</strong><p>6 photos</p></div></article>
          <article className="archive-browser__entry"><span className="archive-browser__date">14</span><div><strong>Finished my project</strong><p>Mood: Good</p></div></article>
        </div>
        <div className="archive-browser__lock"><LockKeyhole size={15} aria-hidden="true" /> Private timeline</div>
      </div>

      <div className="archive-features">
        {archiveItems.map(({ icon: Icon, title, text }) => (
          <article className="archive-feature" key={title}>
            <div className="archive-feature__icon">{createElement(Icon, { size: 22, "aria-hidden": true })}</div>
            <div><h3>{title}</h3><p>{text}</p></div>
          </article>
        ))}
        <a className="text-link" href="/register">Add your first memory <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>
);

export default ArchiveFilmstrip;
