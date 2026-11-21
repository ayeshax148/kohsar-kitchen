// Rule 3 (pricing / fulfilment). Tested in tests/deliveryRule.test.js and used by
// CartContext (fee + checkout blocking), FeeBanner and CheckoutPage.
//
// Condition: delivery is only offered to listed sectors and needs a food subtotal of
// at least Rs 1,500. Delivery costs Rs 200 below Rs 3,000 and is free at Rs 3,000 or more.
// Pickup has no minimum and no fee.
import {
  DELIVERY_FEE,
  DELIVERY_MINIMUM,
  DELIVERY_SECTORS,
  FREE_DELIVERY_THRESHOLD,
} from '../data/business.js';

export function evaluateDelivery({ subtotal, mode, sector = '' }) {
  if (mode === 'pickup') {
    return { allowed: true, code: 'PICKUP', fee: 0, shortfall: 0, toFreeDelivery: 0, message: 'Pickup has no minimum order and no fee.' };
  }

  if (typeof subtotal !== 'number' || !Number.isFinite(subtotal) || subtotal < 0) {
    return { allowed: false, code: 'INVALID_SUBTOTAL', fee: 0, shortfall: 0, toFreeDelivery: 0, message: 'The order total could not be calculated.' };
  }

  // An empty sector means "not chosen yet" (cart page); the checkout form requires one.
  if (sector && !DELIVERY_SECTORS.includes(sector)) {
    return {
      allowed: false,
      code: 'OUT_OF_AREA',
      fee: 0,
      shortfall: 0,
      toFreeDelivery: 0,
      message: `We do not deliver to ${sector} yet. Choose pickup from F-7 Markaz instead.`,
    };
  }

  if (subtotal < DELIVERY_MINIMUM) {
    const shortfall = DELIVERY_MINIMUM - subtotal;
    return {
      allowed: false,
      code: 'BELOW_MINIMUM',
      fee: DELIVERY_FEE,
      shortfall,
      toFreeDelivery: FREE_DELIVERY_THRESHOLD - subtotal,
      message: `Delivery needs a minimum of Rs ${DELIVERY_MINIMUM.toLocaleString('en-PK')}. Add Rs ${shortfall.toLocaleString('en-PK')} more or switch to pickup.`,
    };
  }

  const fee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return {
    allowed: true,
    code: 'OK',
    fee,
    shortfall: 0,
    toFreeDelivery: Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal),
    message: fee === 0 ? 'Free delivery applied.' : `Delivery fee Rs ${DELIVERY_FEE}.`,
  };
}
