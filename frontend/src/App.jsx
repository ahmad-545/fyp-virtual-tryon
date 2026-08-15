import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Context Providers
import AuthContext from './context/AuthContext.jsx';
import AdminContext from './admin/context/AdminContext.jsx';

// Admin & User Components
import AdminApp from './admin/Adminapp.jsx';
import Navbar from './components/Navbar.jsx';
import AnnouncementSlider from './Pages/AnnouncementSlider.jsx'; // 🔴 1. Import AnnouncementSlider

import LoadingPage from './Pages/LoadingPage.jsx'; 
import Home from './Pages/Home.jsx';
import ProductGrid from './Pages/ProductGrid.jsx';
import ProductDetail from './Pages/ProductDetail.jsx';
import Checkout from './Pages/Checkout.jsx';
import OrderConfirmation from './Pages/OrderConfirmation.jsx';
import Footer from './components/Footer.jsx';
import Chatbot from './components/Chatbot.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import TryOnModel from './Pages/TryOnModel.jsx';
import AboutUS from './Pages/AboutUS.jsx';
import FAQs from './Pages/FAQs.jsx';
import Careers from './Pages/Careers.jsx';
import Returnexchange from './Pages/Returnexchange.jsx';
import Contact from './Pages/Contact.jsx';

function App() {
  return (
    <AuthContext>
      <AdminContext>
        <ScrollToTop />
        <Routes>
          {/* Admin routes (No website Navbar/Footer) */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* User routes with Announcement Slider, Navbar, Footer, and Chatbot */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen">
                {/* 🔴 2. Announcement Slider ko Navbar se bilkul upar rakh diya hai */}
                <AnnouncementSlider />
                <Navbar />
                
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<LoadingPage />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/shop" element={<ProductGrid />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/Aboutus" element={<AboutUS />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/returnexchange" element={<Returnexchange />} />
                    <Route path="/contact" element={<Contact />} />
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