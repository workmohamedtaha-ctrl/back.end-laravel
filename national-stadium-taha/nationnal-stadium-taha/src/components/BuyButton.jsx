import { useState } from 'react';
import { Check } from 'lucide-react';

export function BuyButton({ label, onCompleted }) {
  const [bought, setBought] = useState(false);

  const handleClick = () => {
    if (bought) return;
    setBought(true);
    window.setTimeout(onCompleted, 650);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`h-[52px] rounded-full font-semibold text-white flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 ${
        bought
          ? 'w-[52px] bg-emerald-500 shadow-emerald-500/35'
          : 'w-[180px] bg-blue-600 hover:bg-blue-500 shadow-blue-600/35'
      }`}
    >
      {bought ? <Check className="w-7 h-7 stroke-[2.75]" /> : <span>{label}</span>}
    </button>
  );
}