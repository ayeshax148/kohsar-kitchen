// Checkout form validation. Returns { fieldName: message } for every invalid field.
import { DELIVERY_SECTORS, PICKUP_SLOTS } from '../data/business.js';

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,39}$/;
// Pakistani mobile: 03XX-XXXXXXX or 03XXXXXXXXX
const PHONE_PATTERN = /^03\d{2}-?\d{7}$/;

export function validateCheckout(form, mode) {
  const errors = {};
  const name = form.fullName.trim();
  const phone = form.phone.trim();

  if (!name) errors.fullName = 'Enter the name we should ask for at the door or counter.';
  else if (!NAME_PATTERN.test(name)) errors.fullName = 'Use 2 to 40 letters (spaces, apostrophes and hyphens are fine).';

  if (!phone) errors.phone = 'Enter a mobile number so the rider or counter can reach you.';
  else if (!PHONE_PATTERN.test(phone)) errors.phone = 'Use a Pakistani mobile number like 0312-3456789.';

  if (mode === 'delivery') {
    if (!form.sector) errors.sector = 'Choose your sector.';
    else if (!DELIVERY_SECTORS.includes(form.sector)) errors.sector = 'We do not deliver to this area yet. Switch to pickup from F-7 Markaz.';

    const address = form.address.trim();
    if (!address) errors.address = 'Enter a house, street and landmark for the rider.';
    else if (address.length < 10) errors.address = 'Add more detail (at least 10 characters), e.g. "House 12, Street 34".';
  } else if (!PICKUP_SLOTS.includes(form.pickupSlot)) {
    errors.pickupSlot = 'Choose a pickup time.';
  }

  if (form.notes.length > 200) errors.notes = `Keep kitchen notes under 200 characters (currently ${form.notes.length}).`;

  return errors;
}
