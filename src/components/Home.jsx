import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen  flex flex-col items-center justify-center gap-8 text-white px-6">
      <h1 className="evidence-flicker text-5xl font-bold mb-8">
        EVIDENCE-X
      </h1>

      <Link to="/new-case" className="w-full max-w-md">
  <button className="w-full h-24 rounded-2xl bg-emerald-650 hover:bg-emerald-600 text-white text-2xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.30)] hover:shadow-[0_0_40px_rgba(16,185,129,0.55)] border border-emerald-400/30">
    Create New Case
  </button>
</Link>

<Link to="/vault" className="w-full max-w-md">
  <button className="w-full h-24 rounded-2xl hover:bg-emerald-600 text-white text-2xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.55)] border border-emerald-400/30">
    Go to Vault
  </button>
</Link>
    </div>
  );
}

export default Home;