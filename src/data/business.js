// Business profile and operating constants shared by the UI and the rule modules.

export const BUSINESS = {
  name: 'Kohsar Kitchen',
  tagline: 'Home-style Pakistani food for central Islamabad',
  kitchenAddress: 'Shop 14, F-7 Markaz, Islamabad',
  phone: '051-0000000 (fictional)',
  hours: '12:00 to 23:00, every day',
};

// Rule 3 (pricing / fulfilment) — numbers live in one place so the
// banner, cart summary and the tested rule module never disagree.
export const DELIVERY_MINIMUM = 1500; // Rs, delivery orders only
export const DELIVERY_FEE = 200; // Rs, charged below the free threshold
export const FREE_DELIVERY_THRESHOLD = 3000; // Rs, subtotal at or above this ships free

export const DELIVERY_SECTORS = ['Blue Area', 'E-7', 'F-6', 'F-7', 'F-8', 'G-6', 'G-7'];

export const PICKUP_SLOTS = [
  '12:30 to 13:00',
  '13:00 to 13:30',
  '13:30 to 14:00',
  '19:00 to 19:30',
  '19:30 to 20:00',
  '20:00 to 20:30',
  '20:30 to 21:00',
];

export const CATEGORIES = ['Karahi & Handi', 'BBQ', 'Rice', 'Breads', 'Desserts', 'Drinks'];

export const DIETARY_LABELS = {
  vegetarian: 'Vegetarian',
  dairy: 'Contains dairy',
  nuts: 'Contains nuts',
};

export const SPICE_LEVELS = ['Mild', 'Medium', 'Hot'];
