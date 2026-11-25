import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { Glass } from './Glass';
import { SeatCheckoutCard } from './SeatCheckoutCard';

const STEP_COPY = {
  stand: { title: 'Step 1 of 4 · Choose a stand', subtitle: 'Tap any stand to see its prices' },
  block: { title: 'Step 2 of 4 · Choose a block', subtitle: 'Tap a block to see its seats' },
  seat: { title: 'Step 3 of 4 · Choose your seat', subtitle: 'Tap a blue seat. Grey ones are sold' },
  buy: { title: 'Step 4 of 4 · Buy ticket', subtitle: 'Confirm your seat selection' },
};

export function MatchHud({
  match, step, night, badge, seat, vipApplied,
  onBack, onToggleNight, onLookAround, onToggleVip, onBuyTicket,
}) {
  const labels = ['Stand', 'Block', 'Seat', 'Buy'];
  const currentIdx = labels.findIndex((l) => l.toLowerCase() === step);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="pointer-events-auto flex w-full items-center justify-between gap-2">
          <Glass dark={night} onClick={onBack} className="rounded-full p-2.5">
            <ArrowLeft className="w-5 h-5" />
          </Glass>
          <Glass dark={night} className="rounded-full px-4 py-2 text-xs md:text-sm font-semibold">
            {match.homeCode} v {match.awayCode} · {match.shortDate}
          </Glass>
          <Glass dark={night} onClick={onToggleNight} className="rounded-full p-2.5">
            {night ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-800" />}
          </Glass>
        </div>

        {badge && (
          <Glass className="rounded-2xl px-4 py-2 flex items-center gap-3">
            <div>
              <div className="text-sm font-bold leading-tight">{badge.title}</div>
              {badge.subtitle && <div className="text-[11px] text-slate-500">{badge.subtitle}</div>}
            </div>
            <span className="text-base font-extrabold text-blue-600">{badge.price}</span>
          </Glass>
        )}
      </div>

      <div className="pointer-events-auto flex justify-center md:justify-start">
        {seat ? (
          <SeatCheckoutCard
            match={match} seat={seat} vipApplied={vipApplied}
            onLookAround={onLookAround} onToggleVip={onToggleVip} onBuy={onBuyTicket}
          />
        ) : (
          <Glass className="w-full md:max-w-[440px] rounded-[24px] p-4">
            <div className="grid grid-cols-4 gap-2">
              {labels.map((label, idx) => (
                <div key={label} className="flex flex-col items-center">
                  <div className={`h-1 w-full rounded-full ${idx <= currentIdx ? 'bg-blue-600' : 'bg-black/15'}`} />
                  <span className={`mt-1.5 text-[11px] ${idx === currentIdx ? 'font-bold text-slate-900' : 'font-medium text-slate-500'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900">{STEP_COPY[step].title}</div>
                <div className="text-xs text-slate-500">{STEP_COPY[step].subtitle}</div>
              </div>
              {step === 'seat' && (
                <div className="flex flex-col gap-1 text-[11px] font-semibold text-slate-700 shrink-0">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Free</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Sold</span>
                </div>
              )}
            </div>
          </Glass>
        )}
      </div>
    </div>
  );
}