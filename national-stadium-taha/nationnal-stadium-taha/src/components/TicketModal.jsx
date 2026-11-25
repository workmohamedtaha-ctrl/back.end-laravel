import { Check, Eye, Info, Printer, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getTicketCode } from '../data/match';
import { Glass } from './Glass';

export function TicketModal({ match, seat, onClose }) {
  const code = getTicketCode(seat);

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-start gap-4 overflow-y-auto bg-black/75 p-4 backdrop-blur-md md:p-8">
      <div className="flex w-full max-w-md shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">You&apos;re in</h2>
            <p className="text-xs text-white/75">Paid {seat.price} {match.currency} · enjoy the match</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Glass dark onClick={() => window.print()} className="rounded-full p-2.5"><Printer className="w-4 h-4" /></Glass>
          <Glass dark onClick={onClose} className="rounded-full p-2.5"><X className="w-4 h-4" /></Glass>
        </div>
      </div>

      <div id="printable-ticket" className="w-full max-w-md shrink-0 overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="relative h-28 w-full bg-slate-800">
          {seat.previewDataUrl && <img src={seat.previewDataUrl} alt="Seat view" className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute bottom-2.5 left-4 flex items-center gap-1.5 text-xs font-semibold text-white">
            <Eye className="w-4 h-4" /><span>Seat view</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-red-600">{match.homeCode}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-red-800">{match.awayCode}</span>
          </div>
          <h3 className="mt-3 text-xl font-extrabold text-slate-900">{match.homeName} v {match.awayName}</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {match.dateLabel}<br />{match.stadiumName}, {match.venueCity} · {seat.standName}, {seat.tier}
          </p>

          <div className="mt-4 grid grid-cols-4 gap-2 border-y border-slate-100 py-3">
            {[['GATE', seat.gate], ['BLOCK', seat.blockId], ['ROW', seat.row], ['SEAT', seat.seat]].map(([l, v]) => (
              <div key={l}>
                <div className="text-[10px] font-semibold text-slate-400">{l}</div>
                <div className="text-xl font-extrabold text-slate-900">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center">
            <QRCodeSVG value={code} size={168} />
            <p className="mt-3 font-mono text-xs font-bold tracking-wider text-slate-800">{code}</p>
            <p className="mt-0.5 text-xs text-slate-500">Show this code at gate {seat.gate}</p>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 pb-2 text-xs text-white/80">
        <Info className="w-4 h-4 shrink-0" />
        <span>Gates open at 14:30. Allow time for the security check.</span>
      </div>
    </div>
  );
}