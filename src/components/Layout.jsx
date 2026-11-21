import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import MobileCartBar from './MobileCartBar.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // On route change: scroll to top and move keyboard focus to the new page content.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        <Outlet />
      </main>
      <MobileCartBar />
      <Footer />
    </div>
  );
}
