import { useState, useEffect } from 'react';

export function useCountUp(targetValue, duration = 600) {
  const [current, setCurrent] = useState(targetValue);

  useEffect(() => {
    // Check if prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCurrent(targetValue);
      return;
    }

    const start = current;
    const end = Number(targetValue) || 0;
    if (start === end) return;

    const startTime = performance.now();

    let animId;
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = start + (end - start) * ease;
      setCurrent(val);

      if (progress < 1) {
        animId = requestAnimationFrame(update);
      }
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [targetValue, duration]);

  return current;
}
