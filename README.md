# Kohsar Kitchen: Restaurant Ordering Website (CS4032 Assignment 02)

| | |
|---|---|
| Student | [YOUR NAME] |
| Roll number | [ROLL NO] |
| Section | [SECTION] |
| GitHub | [https://github.com/USERNAME/kohsar-kitchen] |
| Deployment | [https://kohsar-kitchen.vercel.app] |
| Final commit | [FINAL COMMIT HASH] |

## Description

Kohsar Kitchen is a fictional home-style Pakistani restaurant in F-7 Markaz, Islamabad. Office workers and small families in central Islamabad browse today's menu, filter and open dishes, build an order, choose delivery or pickup, fill a checkout form and get a confirmation. All orders are **simulated**: no server, no payment, no personal data stored.

## Commands

| Task | Command |
|---|---|
| Install | `npm install` |
| Development server | `npm run dev` (http://localhost:5173) |
| Production build | `npm run build` (output in `dist/`) |
| Preview build | `npm run preview` |
| Rule test | `npm test` (runs `node --test`) |

Requires Node.js 18 or later (tested on Node 22).

## Routes and features

| Route | Purpose |
|---|---|
| `/` | Business intro, delivery conditions, call to action |
| `/menu` | Search, category/dietary filter, sort, hide sold-out; filters kept in the URL |
| `/menu/:itemId` | Dish details, size/spice options, quantity limited by stock; invalid IDs show suggestions |
| `/order` | Edit quantities, remove lines, delivery/pickup, conflicts, calculated summary |
| `/checkout` | Controlled, validated form; rules block invalid completion |
| `/confirmation` | Simulated order number and final summary (survives refresh) |
| `*` | 404 page with links back |

## Operating rules

| Rule | Condition | Code |
|---|---|---|
| 1. Availability | Total quantity of a dish across the order ≤ `stock` left today; `stock 0` = sold out | `src/rules/availabilityRule.js` |
| 2. Compatibility | `pickupOnly` dishes (sizzler platter) cannot be in a delivery order | `src/rules/compatibilityRule.js` |
| 3. Pricing/fulfilment | Delivery only to 7 sectors; food total ≥ Rs 1,500; fee Rs 200 below Rs 3,000, free at Rs 3,000+ | `src/rules/deliveryRule.js` (tested) |

## Reproducing edge cases

Open **Demo controls (testing only)** at the bottom of any page. Settings are saved in `localStorage` (`kk-demo-settings-v1`).

| Case | Steps | Expected |
|---|---|---|
| Loading failure | Tick "Simulate menu loading failure" | Error message + **Try again**; untick, then Try again loads the menu |
| Empty dataset | Tick "Simulate an empty menu" | "Today's menu hasn't been published yet" + Check again |
| No matches | Search `pizza` | "No dishes match" + buttons to remove each filter |
| Invalid URL | Open `/menu/kk-999` or `/abc` | Explanation + link to menu (+ suggestions) |
| Changed availability | Add 3 Mutton Karahi (half), the Grill Platter and Kheer, switch to pickup, then tick "Simulate availability change" | Order page lists each conflict; **Update my order to what's available** fixes them |
| Corrupted save | In DevTools run `localStorage.setItem('kk-cart-v1','{bad')` and reload | App loads with an empty order, no crash |
| Missing image | Open Gajar Halwa (`/menu/kk-113`) | "Photo coming soon" placeholder |
| Long content | Open `/menu/kk-115` at 390 px | Long title wraps, no horizontal scroll |
| Invalid form | Checkout with phone `12345` | Specific message, other fields kept, focus moves to error list |
| Rule 1 boundary | Mutton Karahi stock 4: add 4 | Add button disabled: "All 4 remaining are already in your order" |
| Rule 3 boundary | Delivery with Rs 1,499 vs Rs 1,500 food | 1,499 blocked ("Add Rs 1 more"), 1,500 allowed |

## Simulated operations and known limitations

- Menu loading (`fetchMenu`) and order placement (`submitOrder`) are mocked with `setTimeout` in `src/services/menuApi.js`.
- No payment, no backend, no accounts. Stock does not decrease after an order.
- Personal details are not stored; only the cart and delivery/pickup choice are saved.
- Pickup slots are a fixed list and are not checked against the current time.
- Delivery sectors are matched by name; there is no map or address lookup.

## Concept map

| Concept | File | Component / function |
|---|---|---|
| Components, props | `src/components/MenuCard.jsx` | `MenuCard({ item, inOrderQty, onQuickAdd, fromSearch })` |
| Callback props | `src/components/MenuFilters.jsx`, `CartLineRow.jsx` | `onChange`, `onClear`, `onQtyChange`, `onRemove` |
| Controlled inputs, object state | `src/pages/CheckoutPage.jsx` | `handleChange` → `setForm(prev => ({ ...prev, [name]: value }))` |
| Functional updates, array immutability | `src/context/CartContext.jsx` | `addItem`, `setLineQty`, `removeLine` |
| Shared state | `src/context/MenuContext.jsx`, `CartContext.jsx` | `MenuProvider`, `CartProvider`, `useMenu`, `useCart` |
| Derived values | `src/rules/cartCalculations.js` | `subtotalOf`, `countItems`, `estimateMinutes` |
| Effects + cleanup | `MenuContext.jsx`, `CartContext.jsx`, `hooks/useTimedMessage.js` | cancelled flag, `storage` listener, `clearTimeout` |
| Async + failure | `src/services/menuApi.js`, `MenuContext.jsx` | `fetchMenu`, `submitOrder`, `try/catch` in `load` |
| Local storage | `src/services/storage.js`, `CartContext.jsx` | `readJSON`, `writeJSON`, `loadSavedCart` |
| Routing, URL params | `src/App.jsx`, `pages/ItemDetailsPage.jsx`, `pages/MenuPage.jsx` | `<Routes>`, `useParams`, `useSearchParams` |
| Conditional rendering | `components/StatusViews.jsx` | `LoadingState`, `ErrorState`, `EmptyState` |
| Lists and keys | `pages/MenuPage.jsx` | `results.map(item => <li key={item.id}>…)` |
| Business rules | `src/rules/*.js` | `checkAddQuantity`, `checkFulfilmentCompatibility`, `evaluateDelivery` |
| Rule test | `tests/deliveryRule.test.js` | 6 cases with `node:test` |

## Deployment

Hosted on Vercel. `vercel.json` rewrites every path to `index.html` so refreshing `/menu/kk-101` works. `public/_redirects` does the same on Netlify.
