import { useEffect, useState } from 'react';

// Short-lived feedback text (e.g. "Added to order") that clears itself.
// The timer is cleared if the message changes or the component unmounts.
export function useTimedMessage(duration = 3000) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  return [message, setMessage];
}
