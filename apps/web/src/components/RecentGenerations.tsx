import type { Generation } from '../types';

type RecentGenerationsProps = {
  items: Generation[];
  onSelect: (generation: Generation) => void;
};

export const RecentGenerations = ({ items, onSelect }: RecentGenerationsProps) => (
  <section aria-label="Recent generations" className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">Recent looks</h2>
      <span className="text-xs uppercase tracking-wide text-slate-400">Last {items.length}</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {items.length === 0 && (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          Your next five creations will live here.
        </p>
      )}
      {items.map((generation) => (
        <button
          key={generation.id}
          type="button"
          onClick={() => onSelect(generation)}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <img src={generation.imageUrl} alt="" loading="lazy" className="h-16 w-16 rounded-md object-cover" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900 line-clamp-2">{generation.prompt}</p>
            <p className="text-xs text-slate-500">
              {generation.style} · {new Date(generation.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  </section>
);

