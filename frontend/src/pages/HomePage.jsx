import Navbar from "../components/Navbar";
import middle from "../assets/middle.png";
import bg_image from "../assets/bg_image.png";
import left from "../assets/left.png";
import right from "../assets/right.png";

const features = [
  { img: left,   title: "Capture Memories ✨",   desc: "Fill your capsules with photos, notes, and feelings — preserved perfectly for the future you." },
  { img: middle, title: "Secure Vault 🔒",        desc: "Your memories are locked safe until the perfect moment arrives to reveal them." },
  { img: right,  title: "Timeline Journey 🌸",   desc: "Travel through your personal timeline and relive every cherished moment at just the right time." },
];

const HomePage = () => (
  <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#fce4f3 0%,#e8d5ff 35%,#c7e8ff 70%,#d0f5e8 100%)" }}>
    <Navbar />

    {/* Hero */}
    <section className="relative overflow-hidden px-6 pt-20 pb-28 text-center">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30" style={{ background: "radial-gradient(circle,#f9a8d4,transparent 70%)" }} />
      <div className="pointer-events-none absolute top-10 -right-16 w-72 h-72 rounded-full opacity-25" style={{ background: "radial-gradient(circle,#a5b4fc,transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle,#6ee7b7,transparent 70%)" }} />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-pink-200 text-pink-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
          ✦ Your memories deserve to last forever ✦
        </div>
        <h1 className="chewy text-5xl sm:text-6xl text-transparent bg-clip-text mb-5 leading-tight"
          style={{ backgroundImage: "linear-gradient(135deg,#ec4899,#8b5cf6,#3b82f6)" }}>
          Welcome to Memora ♡
        </h1>
        <p className="text-lg text-purple-700 font-medium mb-8 leading-relaxed">
          Seal your sweetest memories in a time capsule and share them<br className="hidden sm:block" /> with the people you love — past, present &amp; future. 🌷
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/register"
            className="px-8 py-3 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
            ✦ Create your first capsule
          </a>
          <a href="/login"
            className="px-8 py-3 rounded-2xl font-bold text-base bg-white/70 backdrop-blur border border-purple-200 text-purple-700 shadow-sm hover:bg-white transition-all hover:scale-105">
            Sign in ♡
          </a>
        </div>
      </div>

      {/* Floating emoji decorations */}
      <div className="pointer-events-none absolute top-16 left-[8%] text-3xl animate-bounce" style={{ animationDelay: "0s",   animationDuration: "3s"   }}>🌸</div>
      <div className="pointer-events-none absolute top-32 right-[12%] text-2xl animate-bounce" style={{ animationDelay: "0.8s", animationDuration: "2.5s" }}>💌</div>
      <div className="pointer-events-none absolute bottom-16 left-[15%] text-xl animate-bounce" style={{ animationDelay: "1.5s", animationDuration: "4s"   }}>⭐</div>
      <div className="pointer-events-none absolute bottom-24 right-[8%]  text-2xl animate-bounce" style={{ animationDelay: "0.4s", animationDuration: "3.5s" }}>🎀</div>
    </section>

    {/* Features */}
    <section className="py-16 px-6">
      <h2 className="chewy text-3xl text-center text-purple-700 mb-12">What makes Memora special? ˖⁺‧₊✧</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i}
            className="group bg-white/70 backdrop-blur-sm rounded-3xl p-7 text-center shadow-lg border border-white/80 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md ring-4 ring-pink-100 group-hover:ring-purple-200 transition-all">
              <img src={f.img} alt={f.title} className="w-full h-full object-cover" />
            </div>
            <h3 className="chewy text-xl text-purple-800 mb-2">{f.title}</h3>
            <p className="text-sm text-purple-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Quote banner */}
    <section className="py-12 px-6">
      <div className="max-w-3xl mx-auto rounded-3xl p-8 text-center border border-pink-200 shadow-inner"
        style={{ background: "linear-gradient(135deg,#fdf2f8,#f3e8ff)" }}>
        <p className="chewy text-2xl text-pink-600 mb-2">"Sometimes you will never know the value of a moment until it becomes a memory."</p>
        <p className="text-sm text-purple-400 font-medium">— Dr. Seuss ✨</p>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-6 text-center text-sm text-purple-400 border-t border-purple-100">
      <p>© 2025 Memora — made with ♡</p>
      <div className="mt-2 flex justify-center gap-4">
        <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
      </div>
    </footer>
  </div>
);

export default HomePage;
