import { ChevronRight } from 'lucide-react';
import { Glass } from './Glass';

export function IntroOverlay({ sceneReady, onSkip }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-12">
      <div className="mt-4">
        <p className="text-xs font-semibold tracking-[0.22em] text-white/75 uppercase">
          MADRID · SPAIN
        </p>
        <h1 className="mt-2 text-4xl md:text-6xl font-extrabold leading-[1.05] text-white">
          Santiago<br />Bernabéu
        </h1>
        <p className="mt-3 text-sm md:text-base text-white/80">
          Real Madrid Stadium
        </p>
      </div>

      {!sceneReady && (
        <div className="self-center text-sm font-medium text-white/75 animate-pulse">
          Loading the stadium...
        </div>
      )}

      <div className="pointer-events-auto flex justify-end">
        <Glass dark onClick={onSkip} className="rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-1">
          <span>Skip</span>
          <ChevronRight className="w-4 h-4" />
        </Glass>
      </div>
    </div>
  );
}