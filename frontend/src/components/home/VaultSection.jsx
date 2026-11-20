import { CalendarClock, PenLine, ShieldCheck } from "lucide-react";
import { createElement } from "react";

const steps = [
  { icon: PenLine, title: "Add a note or photo", text: "Write a few words or add a photo from your day." },
  { icon: CalendarClock, title: "Set a date", text: "Keep it in your timeline or make it a time capsule for later." },
  { icon: ShieldCheck, title: "Come back anytime", text: "Everything stays organised and easy to find." },
];

const VaultSection = () => (
  <section id="how-it-works" className="home-section home-section--process" aria-labelledby="process-title">
    <div className="section-heading section-heading--narrow">
      <h2 id="process-title">Saving a memory is simple.</h2>
      <p>Add a note or a photo. It will be there whenever you want to look back.</p>
    </div>

    <div className="process-layout" data-reveal="section">
      <ol className="process-list">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="process-step">
            <span className="process-step__number">{index + 1}</span>
            <div className="process-step__icon">{createElement(Icon, { size: 20, "aria-hidden": true })}</div>
            <div><h3>{title}</h3><p>{text}</p></div>
          </li>
        ))}
      </ol>

      <div className="capsule-illustration" aria-label="A letter tucked into a sealed time capsule" role="img">
        <div className="capsule-illustration__letter"><p>A note for<br />future me</p><span>Saved on November 20</span></div>
        <div className="capsule-illustration__envelope"><div className="capsule-illustration__flap" /><div className="capsule-illustration__seal">M</div></div>
        <p className="capsule-illustration__caption">Time capsule</p>
      </div>
    </div>
  </section>
);

export default VaultSection;
