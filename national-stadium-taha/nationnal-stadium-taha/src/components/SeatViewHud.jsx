import { X } from 'lucide-react';
import { Glass } from './Glass';
import { BuyButton } from './BuyButton';

export function SeatViewHud({ match, seat, onExit, onBuyCompleted }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="pointer-events-auto flex w-full items-center gap-3">
          <Glass dark onClick={onExit} className="rounded-full p-2.5">
            <X className="w-5 h-5" />
          </Glass>
          <Glass dark className="rounded-full px-4 py-2 text-xs md:text-sm font-semibold">
            Block {seat.blockId}, row {seat.row}, seat {seat.seat}
          </Glass>
        </div>
        <Glass dark className="rounded-full px-3.5 py-1.5 text-xs text-white/85">
          Drag to look around
        </Glass>
      </div>

      <div className="pointer-events-auto flex items-center justify-between gap-3 md:justify-center md:gap-6">
        <Glass dark onClick={onExit} className="rounded-full px-6 py-3.5 text-sm font-semibold">
          Another seat
        </Glass>
        <BuyButton label={`Buy, ${seat.price} ${match.currency}`} onCompleted={onBuyCompleted} />
      </div>
    </div>
  );
}