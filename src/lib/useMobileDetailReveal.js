import { useEffect, useRef } from 'react';

export function useMobileDetailReveal(selection) {
  const detailRef = useRef(null);
  const previousSelection = useRef(selection);

  useEffect(() => {
    if (previousSelection.current === selection) return;
    previousSelection.current = selection;
    if (!window.matchMedia('(max-width: 760px)').matches) return;
    const frame = window.requestAnimationFrame(() => {
      const target = detailRef.current;
      if (!target) return;
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selection]);

  return detailRef;
}
