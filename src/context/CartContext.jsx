import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMenu } from './MenuContext.jsx';
import { readJSON, writeJSON } from '../services/storage.js';
import { checkAddQuantity, findCartConflicts, maxAllowedQty, resolveCartConflicts } from '../rules/availabilityRule.js';
import { checkFulfilmentCompatibility } from '../rules/compatibilityRule.js';
import { evaluateDelivery } from '../rules/deliveryRule.js';
import { countItems, estimateMinutes, subtotalOf } from '../rules/cartCalculations.js';

const CartContext = createContext(null);
const CART_KEY = 'kk-cart-v1';

export function makeLineId(itemId, sizeId, spice) {
  return [itemId, sizeId || 'std', spice || 'none'].join('|');
}

// Only well-formed lines survive a restore; anything else is dropped and reported.
function isValidLine(line) {
  return (
    line && typeof line.itemId === 'string' && typeof line.lineId === 'string' &&
    Number.isInteger(line.qty) && line.qty > 0
  );
}

function loadSavedCart() {
  const saved = readJSON(CART_KEY, null);
  if (saved === null) return { lines: [], mode: 'delivery', notice: '' };
  const rawLines = Array.isArray(saved?.lines) ? saved.lines : [];
  const lines = rawLines.filter(isValidLine);
  const mode = saved?.mode === 'pickup' ? 'pickup' : 'delivery';
  let notice = '';
  if (rawLines.length !== lines.length || !Array.isArray(saved?.lines)) {
    notice = 'Part of your saved order could not be read and was removed.';
  } else if (lines.length > 0) {
    notice = 'We restored the order you started earlier and checked it against today’s menu.';
  }
  return { lines, mode, notice };
}

export function CartProvider({ children }) {
  const { status: menuStatus, itemsById } = useMenu();
  // Lazy initialiser: read localStorage once, not on every render.
  const [initial] = useState(loadSavedCart);
  const [lines, setLines] = useState(initial.lines);
  const [mode, setMode] = useState(initial.mode);
  const [restoreNotice, setRestoreNotice] = useState(initial.notice);

  // Persist the selection and fulfilment preference (no personal details are stored).
  useEffect(() => {
    writeJSON(CART_KEY, { lines, mode });
  }, [lines, mode]);

  // Keep several open tabs consistent; listener is removed on unmount.
  useEffect(() => {
    function onStorage(event) {
      if (event.key !== CART_KEY) return;
      const next = loadSavedCart();
      setLines(next.lines);
      setMode(next.mode);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback(
    (itemId, { sizeId = '', spice = '', qty = 1 } = {}) => {
      const item = itemsById[itemId];
      const check = checkAddQuantity(item, lines, qty);
      if (!check.ok) return check;
      const lineId = makeLineId(itemId, sizeId, spice);
      setLines((prev) => {
        const existing = prev.find((line) => line.lineId === lineId);
        if (existing) {
          return prev.map((line) => (line.lineId === lineId ? { ...line, qty: line.qty + qty } : line));
        }
        // name is a snapshot so a dish later removed from the menu can still be named.
        return [...prev, { lineId, itemId, name: item.name, sizeId, spice, qty }];
      });
      return { ok: true, message: `Added ${qty} × ${item.name}.` };
    },
    [itemsById, lines],
  );

  // Clamp to what Rule 1 allows; report when the request was reduced.
  const setLineQty = useCallback(
    (lineId, requestedQty) => {
      const line = lines.find((l) => l.lineId === lineId);
      if (!line) return { ok: false, message: '' };
      const max = maxAllowedQty(itemsById[line.itemId], lines, lineId);
      const qty = Math.max(1, Math.min(requestedQty, max));
      setLines((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, qty } : l)));
      return qty < requestedQty
        ? { ok: false, message: `Only ${max} can be ordered today.` }
        : { ok: true, message: '' };
    },
    [itemsById, lines],
  );

  const removeLine = useCallback((lineId) => {
    setLines((prev) => prev.filter((line) => line.lineId !== lineId));
  }, []);

  const removeItems = useCallback((itemIds) => {
    setLines((prev) => prev.filter((line) => !itemIds.includes(line.itemId)));
  }, []);

  const fixConflicts = useCallback(() => {
    setLines((prev) => resolveCartConflicts(prev, itemsById));
  }, [itemsById]);

  const clearCart = useCallback(() => setLines([]), []);
  const dismissRestoreNotice = useCallback(() => setRestoreNotice(''), []);

  // ---------- Derived values (recalculated from current state) ----------
  const menuReady = menuStatus === 'success';
  const itemCount = countItems(lines);
  const subtotal = subtotalOf(lines, itemsById);
  const delivery = evaluateDelivery({ subtotal, mode });
  const conflicts = useMemo(
    () => (menuReady ? findCartConflicts(lines, itemsById) : []),
    [menuReady, lines, itemsById],
  );
  const compatibility = checkFulfilmentCompatibility(lines, itemsById, mode);
  const total = subtotal + (mode === 'delivery' ? delivery.fee : 0);
  const etaMinutes = estimateMinutes(lines, itemsById, mode);

  const blockers = [];
  if (!menuReady) blockers.push('Waiting for today’s menu to load.');
  if (lines.length === 0) blockers.push('Your order is empty.');
  if (conflicts.length > 0) blockers.push('Some dishes in your order changed availability. Fix them first.');
  if (!compatibility.ok) blockers.push(compatibility.message);
  if (lines.length > 0 && !delivery.allowed) blockers.push(delivery.message);

  const value = {
    lines, mode, setMode, addItem, setLineQty, removeLine, removeItems, fixConflicts, clearCart,
    restoreNotice, dismissRestoreNotice, menuReady,
    itemCount, subtotal, delivery, conflicts, compatibility, total, etaMinutes,
    blockers, canCheckout: blockers.length === 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>.');
  return context;
}
