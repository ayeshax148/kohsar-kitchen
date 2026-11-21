import { Route, Routes } from 'react-router-dom';
import { MenuProvider } from './context/MenuContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import ItemDetailsPage from './pages/ItemDetailsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <MenuProvider>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="menu/:itemId" element={<ItemDetailsPage />} />
            <Route path="order" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="confirmation" element={<ConfirmationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </MenuProvider>
  );
}
