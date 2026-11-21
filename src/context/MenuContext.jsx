import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMenu } from '../services/menuApi.js';

const MenuContext = createContext(null);

// Single source of menu data for listings, details, cart and checkout.
export function MenuProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Ignore a response that arrives after a newer request or after unmount.
    let cancelled = false;

    async function load() {
      setStatus('loading');
      setError('');
      try {
        const data = await fetchMenu();
        if (!cancelled) {
          setItems(data);
          setStatus('success');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'The menu could not be loaded.');
          setStatus('error');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const itemsById = useMemo(
    () => Object.fromEntries(items.map((item) => [item.id, item])),
    [items],
  );

  const value = useMemo(
    () => ({ status, items, itemsById, error, reload }),
    [status, items, itemsById, error, reload],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used inside <MenuProvider>.');
  return context;
}
