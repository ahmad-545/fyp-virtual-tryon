import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo2.png'; 

function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("hasLoaded");
    if (hasLoaded) {
      navigate('/home'); 
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem("hasLoaded", "true");
        navigate('/home');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center justify-center"
      >
        {/* Rotating Circular Loader (Background Ring) - Size wahi rakha hai */}
        <div className="absolute w-40 h-40 md:w-56 md:h-56 border-4 border-gray-200 rounded-full"></div>
        
        {/* The Active Spinner Segment (Foreground Arc) - Size wahi rakha hai */}
        <div className="absolute w-40 h-40 md:w-56 md:h-56 border-4 border-t-[#C19A6B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>

        {/* The Static Logo (Center) - Size ko increase kiya hai */}
        {/* Pehle w-24/md:w-32 tha, ab w-32/md:w-40 hai */}
        <img src={logo} alt="TryLo Logo" className="w-32 md:w-40 relative z-10" />
      </motion.div>
    </div>
  );
}

export default LoadingPage;