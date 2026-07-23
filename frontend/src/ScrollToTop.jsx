import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 💡 Jaise hi url path change hoga, page automatic top par scroll ho jayega
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}