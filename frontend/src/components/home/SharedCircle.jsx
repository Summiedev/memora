import { MessageCircleMore, Send, UserRoundPlus } from "lucide-react";

const SharedCircle = () => (
  <section id="shared" className="home-section home-section--shared" aria-labelledby="shared-title">
    <div className="shared-layout">
      <div className="shared-copy">
        <h2 id="shared-title">Share memories with people you trust.</h2>
        <p>Send a time capsule, share a page, or keep a note for someone. You choose what stays private.</p>
        <ul className="shared-points">
          <li><UserRoundPlus size={18} aria-hidden="true" /> Invite a trusted circle</li>
          <li><Send size={18} aria-hidden="true" /> Send a time capsule to a friend</li>
          <li><MessageCircleMore size={18} aria-hidden="true" /> Add notes to shared memories</li>
        </ul>
      </div>

      <div className="shared-note" aria-label="Example shared-memory conversation" role="img">
        <div className="shared-note__header"><div className="avatar-stack" aria-hidden="true"><span>J</span><span>A</span><span>L</span></div><div><strong>Weekend by the lake</strong><p>Shared with 3 people</p></div><span className="shared-note__private">private</span></div>
        <div className="shared-note__thread">
          <div className="shared-note__message"><span className="avatar avatar--jade">J</span><p><strong>Jules</strong> I forgot how clear the water was that day.</p></div>
          <div className="shared-note__message shared-note__message--reply"><span className="avatar avatar--lilac">A</span><p><strong>Ada</strong> I still have the photos from the way home.</p></div>
        </div>
        <div className="shared-note__composer"><span>Leave a note…</span><Send size={17} aria-hidden="true" /></div>
      </div>
    </div>
  </section>
);

export default SharedCircle;
