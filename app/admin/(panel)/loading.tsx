export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Carregando painel">
      <div className="h-4 w-28 rounded bg-white/8" />
      <div className="h-10 w-64 rounded bg-white/8" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-36 rounded-2xl border border-white/8 bg-white/[0.03]" />
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-white/8 bg-white/[0.03]" />
    </div>
  );
}
