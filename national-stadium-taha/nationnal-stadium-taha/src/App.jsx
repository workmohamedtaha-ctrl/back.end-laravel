import { useCallback, useRef, useState } from 'react';
import { SAMPLE_MATCH } from './data/match';
import { StadiumCanvas } from './components/StadiumCanvas';
import { IntroOverlay } from './components/IntroOverlay';
import { HomeSheet } from './components/HomeSheet';
import { MatchHud } from './components/MatchHud';
import { SeatViewHud } from './components/SeatViewHud';
import { TicketModal } from './components/TicketModal';
import { Glass } from './components/Glass';

export default function App() {
  const stadiumRef = useRef(null);

  const [phase, setPhase] = useState('intro');
  const [step, setStep] = useState('stand');
  const [sceneReady, setSceneReady] = useState(false);
  const [night, setNight] = useState(false);
  const [activeBadge, setActiveBadge] = useState(null);
  const [hoverBadge, setHoverBadge] = useState(null);
  const [seat, setSeat] = useState(null);
  const [vipApplied, setVipApplied] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [toast, setToast] = useState(null);

  const toastTimer = useRef(null);
  const showToast = useCallback((msg) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const handleBack = () => {
    if (seat) {
      setSeat(null);
      setStep('seat');
      stadiumRef.current?.goBackStep();
    } else if (step === 'block' || step === 'seat') {
      setStep('stand');
      setActiveBadge(null);
      stadiumRef.current?.goBackStep();
    } else {
      setPhase('home');
      stadiumRef.current?.setMode('overview');
    }
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0b152b] select-none">
      <StadiumCanvas
        ref={stadiumRef}
        onReady={() => setSceneReady(true)}
        onIntroDone={() => { setPhase('home'); setNight(false); }}
        onStandSelected={({ standName, price }) => {
          setStep('seat');
          setActiveBadge({ title: standName, price, subtitle: '1,365 seats left' });
        }}
        onBlockSelected={({ standName, blockId, price }) => {
          setStep('seat');
          setActiveBadge({ title: `Block ${blockId}`, price, subtitle: standName });
        }}
        onSeatSelected={(selected) => {
          setStep('seat');
          setVipApplied(false);
          setSeat(selected);
          setActiveBadge({ title: `Block ${selected.blockId}`, price: selected.price, subtitle: selected.standName });
        }}
        onHoverChange={setHoverBadge}
        onToast={showToast}
      />

      {phase === 'intro' && (
        <IntroOverlay
          sceneReady={sceneReady}
          onSkip={() => { stadiumRef.current?.skipIntro(); setPhase('home'); setNight(false); }}
        />
      )}

      {phase === 'home' && (
        <HomeSheet
          match={SAMPLE_MATCH}
          onChooseSeats={() => {
            setPhase('explore'); setStep('stand'); setSeat(null); setActiveBadge(null);
            stadiumRef.current?.setMode('stand');
          }}
        />
      )}

      {phase === 'explore' && (
        <MatchHud
          match={SAMPLE_MATCH}
          step={step}
          night={night}
          badge={hoverBadge ?? activeBadge}
          seat={seat}
          vipApplied={vipApplied}
          onBack={handleBack}
          onToggleNight={() => {
            const next = !night;
            setNight(next);
            stadiumRef.current?.setNight(next);
          }}
          onLookAround={() => { setPhase('view'); stadiumRef.current?.setMode('view'); }}
          onToggleVip={() => {
            if (!seat) return;
            const nextVip = !vipApplied;
            setVipApplied(nextVip);
            setSeat({ ...seat, price: nextVip ? seat.price + 800 : seat.price - 800 });
          }}
          onBuyTicket={() => setShowTicket(true)}
        />
      )}

      {phase === 'view' && seat && (
        <SeatViewHud
          match={SAMPLE_MATCH}
          seat={seat}
          onExit={() => { setPhase('explore'); stadiumRef.current?.setMode('seat'); }}
          onBuyCompleted={() => setShowTicket(true)}
        />
      )}

      {showTicket && seat && (
        <TicketModal
          match={SAMPLE_MATCH}
          seat={seat}
          onClose={() => {
            setShowTicket(false); setPhase('home'); setSeat(null); setActiveBadge(null);
            stadiumRef.current?.setMode('overview');
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed top-20 inset-x-0 z-40 flex justify-center">
          <Glass dark className="rounded-full px-4 py-2 text-xs font-medium">{toast}</Glass>
        </div>
      )}
    </main>
  );
}