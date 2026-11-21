// Automated test for Rule 3 (delivery minimum, fee and service area).
// Run with: npm test   (which runs: node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDelivery } from '../src/rules/deliveryRule.js';

test('valid: Rs 2,000 delivery to F-7 is allowed with the Rs 200 fee', () => {
  const result = evaluateDelivery({ subtotal: 2000, mode: 'delivery', sector: 'F-7' });
  assert.equal(result.allowed, true);
  assert.equal(result.code, 'OK');
  assert.equal(result.fee, 200);
  assert.equal(result.shortfall, 0);
});

test('limit: exactly Rs 1,500 meets the delivery minimum', () => {
  const result = evaluateDelivery({ subtotal: 1500, mode: 'delivery', sector: 'G-6' });
  assert.equal(result.allowed, true);
  assert.equal(result.fee, 200);
});

test('limit: exactly Rs 3,000 gets free delivery', () => {
  const result = evaluateDelivery({ subtotal: 3000, mode: 'delivery', sector: 'E-7' });
  assert.equal(result.allowed, true);
  assert.equal(result.fee, 0);
});

test('broken: Rs 1,499 is below the minimum and reports the Rs 1 shortfall', () => {
  const result = evaluateDelivery({ subtotal: 1499, mode: 'delivery', sector: 'F-7' });
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'BELOW_MINIMUM');
  assert.equal(result.shortfall, 1);
  assert.match(result.message, /Rs 1 more/);
});

test('broken: a sector outside the service area is refused', () => {
  const result = evaluateDelivery({ subtotal: 5000, mode: 'delivery', sector: 'Other (not listed)' });
  assert.equal(result.allowed, false);
  assert.equal(result.code, 'OUT_OF_AREA');
});

test('pickup ignores the minimum: Rs 100 pickup is allowed with no fee', () => {
  const result = evaluateDelivery({ subtotal: 100, mode: 'pickup' });
  assert.equal(result.allowed, true);
  assert.equal(result.fee, 0);
});
