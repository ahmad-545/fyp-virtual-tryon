import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Context Providers
import AuthContext from './context/AuthContext.jsx';
import AdminContext from './admin/context/AdminContext.jsx';

// Admin & User Components
import AdminApp from './admin/Adminapp.jsx';
import Navbar from './Components/Navbar.jsx';
import Home from './pages/Home.jsx';
import ProductGrid from './Pages/ProductGrid.jsx';
import ProductDetail from './Pages/ProductDetail.jsx';
import Checkout from './Pages/Checkout.jsx';
import OrderConfirmation from './Pages/OrderConfirmation.jsx';
import Footer from './components/Footer.jsx';
import Chatbot from './components/Chatbot.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import TryOnModel from './Pages/TryOnModel.jsx';

function App() {
  return (
    <AuthContext>
      <AdminContext>
        {/* ScrollToTop should stay inside Router context (BrowserRouter is usually in index.js/main.tsx) */}
        <ScrollToTop />
        <Routes>
          {/* Admin routes (No website Navbar/Footer) */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* User routes with Navbar, Footer, and Chatbot */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<ProductGrid />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/virtual-room" element={<TryOnModel isOpen={true} onClose={() => window.history.back()} />} />
                  </Routes>
                </main>
                <Footer />
                <Chatbot />
              </div>
            }
          />
        </Routes>
      </AdminContext>
    </AuthContext>
  );
}

export default App;