// Rule 2 (eligibility / compatibility).
// Condition: dishes marked `pickupOnly` (served on a hot iron plate) cannot be in a
// delivery order. Checkout is blocked until the customer switches to pickup or removes them.

export function findDeliveryIncompatible(lines, itemsById, mode) {
  if (mode !== 'delivery') return [];
  const ids = new Set(
    lines.filter((line) => itemsById[line.itemId]?.pickupOnly).map((line) => line.itemId),
  );
  return [...ids];
}

export function checkFulfilmentCompatibility(lines, itemsById, mode) {
  const blockedIds = findDeliveryIncompatible(lines, itemsById, mode);
  if (blockedIds.length === 0) return { ok: true, blockedIds, message: '' };
  const names = blockedIds.map((id) => itemsById[id].name).join(', ');
  return {
    ok: false,
    blockedIds,
    message: `${names} ${blockedIds.length === 1 ? 'is' : 'are'} pickup only. Switch to pickup or remove ${blockedIds.length === 1 ? 'it' : 'them'} to continue.`,
  };
}
