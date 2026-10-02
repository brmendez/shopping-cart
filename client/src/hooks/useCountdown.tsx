import { useEffect, useState } from 'react';

// Seconds left until `target` (an ISO time), updated every second. Null until a target is known.
export const useCountdown = (target: string | null) => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  if (!target) {
    return null;
  }

  return Math.max(0, Math.ceil((new Date(target).getTime() - now) / 1000));
};
