export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-light mb-2" />
      <div className="h-4 w-72 animate-pulse rounded-lg bg-surface-light mb-8" />
      
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex min-h-[160px] animate-pulse rounded-3xl border border-border bg-card p-6">
            <div className="flex-1">
              <div className="h-6 w-32 rounded-lg bg-surface-light mb-2" />
              <div className="h-4 w-24 rounded-lg bg-surface-light mb-4" />
              <div className="h-8 w-20 rounded-lg bg-surface-light" />
            </div>
            <div className="h-24 w-24 shrink-0 rounded-2xl bg-surface-light ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
