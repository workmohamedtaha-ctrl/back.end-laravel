import { ChevronRight } from 'lucide-react';
import { Glass } from './Glass';

export function HomeSheet({ match, onChooseSeats }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-8">
      <div>
        <Glass className="inline-block rounded-full px-5 py-2.5 text-sm font-bold">
          Santiago Bernabéu
        </Glass>
      </div>

      <div className="pointer-events-auto w-full md:max-w-[430px] rounded-[28px] bg-white/95 backdrop-blur-xl p-6 shadow-2xl border border-black/5">
        <h2 className="text-2xl font-bold text-slate-900">Upcoming matches</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a match to see which seats are free, in 3D.
        </p>

        <div className="mt-4 rounded-2xl bg-slate-100/90 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600">{match.competition}</span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-red-600 border border-black/10">
              {match.homeCode}
            </span>
            <div className="flex-1 text-lg font-bold leading-tight text-slate-900">
              {match.homeName}<br />v {match.awayName}
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-red-800 border border-black/10">
              {match.awayCode}
            </span>
          </div>

          <p className="mt-3 text-xs font-medium text-slate-600">{match.dateLabel}</p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">
              From {match.minPrice} {match.currency}
            </span>
            <button
              type="button"
              onClick={onChooseSeats}
              className="flex items-center gap-1 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition px-5 py-2.5 text-sm font-semibold text-white cursor-pointer shadow-lg shadow-blue-600/25"
            >
              <span>Choose seats</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          Map data © OpenStreetMap contributors
        </p>
      </div>
    </div>
  );
}