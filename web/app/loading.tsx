export default function Loading() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-pulse">
      <div className="flex-1 min-w-0 lg:max-w-[728px] space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 py-6 border-b border-border">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-surface rounded" />
              <div className="h-6 w-3/4 bg-surface rounded" />
              <div className="h-4 w-full bg-surface rounded" />
              <div className="h-3 w-32 bg-surface rounded" />
            </div>
            <div className="shrink-0 w-28 h-28 rounded-lg bg-surface" />
          </div>
        ))}
      </div>
      <div className="w-full lg:w-[296px] shrink-0 space-y-4">
        <div className="h-4 w-24 bg-surface rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-surface rounded" />
          <div className="h-4 w-4/5 bg-surface rounded" />
          <div className="h-4 w-3/4 bg-surface rounded" />
        </div>
      </div>
    </div>
  );
}