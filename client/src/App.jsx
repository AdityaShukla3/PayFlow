export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
          PF
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">PayFlow</h1>
        <p className="text-sm text-slate-400">
          Simulated Digital Wallet System. Phase 1 project scaffolding ready.
        </p>
        <div className="pt-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 py-2 px-3 rounded-lg">
          Client scaffold active
        </div>
      </div>
    </div>
  );
}
