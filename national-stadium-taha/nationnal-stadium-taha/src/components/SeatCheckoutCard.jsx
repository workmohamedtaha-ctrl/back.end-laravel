import { Eye } from 'lucide-react';

export function SeatCheckoutCard({ match, seat, vipApplied, onLookAround, onToggleVip, onBuy }) {
  return (
    <div className="w-full md:max-w-[440px] rounded-[24px] bg-white/95 backdrop-blur-xl p-4 shadow-2xl border border-black/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Row {seat.row}, Seat {seat.seat}</h3>
        <span className="text-xs font-semibold text-emerald-600">Available</span>
      </div>

      <button
        type="button"
        onClick={onLookAround}
        className="group relative mt-2.5 block h-[92px] w-full overflow-hidden rounded-2xl bg-slate-800 cursor-pointer"
      >
        {seat.previewDataUrl && (
          <img
            src={seat.previewDataUrl}
            alt="View from your seat"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs font-semibold text-white">
          <Eye className="w-4 h-4" />
          <span>View from your seat</span>
        </div>
        <span className="absolute bottom-2 right-3 rounded-full bg-white/25 backdrop-blur px-3 py-1 text-[11px] font-semibold text-white">
          Look around
        </span>
      </button>

      <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">
        {match.homeCode} v {match.awayCode} · {match.shortDate}<br />
        {seat.standName}, {seat.tier}
      </p>

      <div className="mt-3 grid grid-cols-5 gap-2">
        <Stat label="BLOCK" value={seat.blockId} />
        <Stat label="ROW" value={`${seat.row}`} />
        <Stat label="SEAT" value={`${seat.seat}`} />
        <Stat label="GATE" value={seat.gate} />
        <Stat label={match.currency} value={`${seat.price}`} accent />
      </div>

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={onToggleVip}
          className={`rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-95 cursor-pointer ${
            vipApplied ? 'bg-amber-500 text-white' : 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25'
          }`}
        >
          {vipApplied ? 'VIP Added' : 'VIP +800'}
        </button>
        <button
          type="button"
          onClick={onBuy}
          className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition py-3 text-sm font-bold text-white cursor-pointer shadow-lg shadow-blue-600/25"
        >
          Buy ticket
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-slate-400">{label}</div>
      <div className={`text-base font-extrabold ${accent ? 'text-blue-600' : 'text-slate-900'}`}>{value}</div>
    </div>
  );
}