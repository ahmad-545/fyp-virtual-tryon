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

function App() {
  return (
    <AuthContext>
      <AdminContext>
     
        
        {/* 
          Yahan ek trick hai: 
          Admin panel par hum main website ka Navbar nahi dikhana chahte. 
          Isliye hum sirf tabhi Navbar dikhayenge jab hum admin path par na hon.
        */}
        <Routes>
          {/* Admin routes (Layout handle karega) */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* User routes (Yahan Navbar aur Footer dikhenge) */}
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<ProductGrid/>} />
                
              <Route path="/product/:id" element={<ProductDetail/>} />
               <Route path="/Checkout" element={<Checkout/>} />


                {/* Baki user pages yahan aayenge */}
              </Routes>
            </>
          } />
        </Routes>
      </AdminContext>
    </AuthContext>
  );
}

export default App;