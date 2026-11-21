// Asynchronous mock loader. There is no real server: the promise resolves local data
// after a short delay so loading, failure and retry states can be seen and tested.
import { MENU_ITEMS } from '../data/menu.js';
import { getDemoSettings } from './demoSettings.js';

const LOAD_DELAY_MS = 700;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// "Changed availability" demo: simulates the kitchen updating stock after a customer saved a cart.
function applyAvailabilityChange(items) {
  return items
    .filter((item) => item.id !== 'kk-112') // Kheer taken off today's menu
    .map((item) => {
      if (item.id === 'kk-102') return { ...item, stock: 1 }; // Mutton Karahi nearly gone
      if (item.id === 'kk-107') return { ...item, stock: 0 }; // Grill platter sold out
      return item;
    });
}

export async function fetchMenu() {
  await wait(LOAD_DELAY_MS);
  const demo = getDemoSettings();

  if (demo.failLoading) {
    throw new Error('The menu service did not respond (simulated failure).');
  }
  if (demo.emptyMenu) {
    return [];
  }
  // Return copies so callers can never mutate the source data.
  const items = MENU_ITEMS.map((item) => ({ ...item }));
  return demo.availabilityChanged ? applyAvailabilityChange(items) : items;
}

// Simulated order submission. No network request is made and no payment is taken.
export async function submitOrder(order) {
  await wait(900);
  const orderNumber = `KK-${Date.now().toString().slice(-6)}`;
  return { ...order, orderNumber, placedAt: new Date().toISOString() };
}
