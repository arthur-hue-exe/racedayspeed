export default function StoreLoading() {
  return (
    <div className="container-race pb-24 pt-[130px]" aria-label="Carregando página">
      <div className="h-3 w-24 animate-pulse rounded bg-white/6" />
      <div className="mt-5 h-12 w-2/3 max-w-xl animate-pulse rounded bg-white/6" />
      <div className="mt-4 h-4 w-1/2 max-w-md animate-pulse rounded bg-white/4" />
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[5/4] animate-pulse rounded-2xl bg-white/5" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-white/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
