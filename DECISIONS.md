# Frontend Decisions

Screenshots referenced below are in the PDF report (section 5 and 7).

## Decision 1: Show delivery charges, minimum and area before browsing (information hierarchy)

| Field | Entry |
|---|---|
| Problem | On [REFERENCE SITE 1 URL] the delivery fee and minimum order only appear at checkout, after the customer has built an order. |
| Decision | A fee banner at the top of `/menu` lists the fee, minimum, free-delivery threshold, sectors and pickup option. Once the order has items it shows live progress ("Add Rs 1,380 more…"). The order summary repeats this with a progress bar. |
| Alternative | Show the conditions only in the cart page or in a modal at the start of checkout. |
| Reason | Office lunch orders are often small; knowing the Rs 1,500 minimum early lets customers add a dish or choose pickup instead of abandoning at checkout. |
| Tradeoff | The banner takes vertical space on mobile before the first dish. It uses a two-column grid to stay compact. |
| Code location | `src/components/FeeBanner.jsx` (`FeeBanner`), `src/components/OrderSummary.jsx`, rule in `src/rules/deliveryRule.js` (`evaluateDelivery`) |
| Evidence | Open `/menu` → banner visible above filters. Add Garlic Naan → banner reads "Your food total is Rs 120. Add Rs 1,380 more…". |

## Decision 2: Keep search and filters in the URL (interaction / state)

| Field | Entry |
|---|---|
| Problem | On [REFERENCE SITE 2 URL] opening an item and pressing Back resets the search/category, so the customer must filter again. |
| Decision | `q`, `cat`, `diet`, `avail` and `sort` are stored as URL search parameters with `useSearchParams` (`replace: true` while typing). Dish links pass `state.from`, so the "Back to menu" link and the browser Back button both return to the same filtered list. |
| Alternative | Keep filters in React context or `localStorage`. |
| Reason | The URL survives Back/Forward, refresh and sharing a link with colleagues ordering together, without extra state to sync. |
| Tradeoff | URLs get longer, and every filter value must be validated when read (unknown sort falls back to "Most ordered"). |
| Code location | `src/pages/MenuPage.jsx` (`updateFilter`, `clearFilters`, `filterMenu`), `src/components/MenuCard.jsx` (`linkState`) |
| Evidence | Search "naan", choose Breads → open Garlic Naan → press Back → search box and category are unchanged. |

## Decision 3: Show availability and pickup-only status on every card, with a mobile order bar (mobile layout / hierarchy)

| Field | Entry |
|---|---|
| Problem | On [REFERENCE SITE 3 URL] items look orderable in the listing; "sold out" or "not available for delivery" appears only after opening the item or at checkout, and on mobile the cart is hard to reach. |
| Decision | Each card shows a text badge ("12 available today", "Only 2 left today", "Sold out today", "Pickup only"); sold-out cards are greyed and their button disabled. Below 760 px a fixed bottom bar shows item count, total and a **View order** button. |
| Alternative | Hide sold-out dishes completely, and use a cart icon in the header only. |
| Reason | Customers do not waste time on dishes they cannot order, but can still see what the restaurant offers. The bottom bar keeps the next step within thumb reach on 390 px screens. |
| Tradeoff | Cards carry more information; the bottom bar covers part of the screen, so the footer gets extra bottom padding. A "Hide sold-out dishes" filter is provided for customers who prefer a shorter list. |
| Code location | `src/components/ItemBadges.jsx` (`AvailabilityBadge`, `PickupOnlyBadge`), `src/components/MenuCard.jsx`, `src/components/MobileCartBar.jsx`, styles in `src/styles/global.css` (`.mobile-cart-bar`) |
| Evidence | `/menu?cat=BBQ` shows Chicken Tikka "Sold out today" with a disabled button and the Grill Platter "Pickup only". At 390 px add any dish → bottom bar appears. |
