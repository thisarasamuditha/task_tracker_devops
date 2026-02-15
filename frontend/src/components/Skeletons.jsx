export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-surface dark:bg-borderDark rounded" />
          <div className="h-8 w-20 bg-surface dark:bg-borderDark rounded" />
        </div>
        <div className="w-12 h-12 bg-surface dark:bg-borderDark rounded-2xl" />
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surfaceDark border border-border dark:border-borderDark rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 bg-surface dark:bg-borderDark rounded" />
          <div className="h-3 w-full bg-surface dark:bg-borderDark rounded" />
          <div className="h-3 w-5/6 bg-surface dark:bg-borderDark rounded" />
          <div className="flex gap-2 pt-1">
            <div className="h-6 w-20 bg-surface dark:bg-borderDark rounded-full" />
            <div className="h-6 w-24 bg-surface dark:bg-borderDark rounded-full" />
          </div>
        </div>
        <div className="w-10 h-10 bg-surface dark:bg-borderDark rounded-xl" />
      </div>
    </div>
  );
}
