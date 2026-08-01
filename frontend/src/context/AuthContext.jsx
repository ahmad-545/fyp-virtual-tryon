import { createContext } from "react";

export const AuthDataContext = createContext();

function AuthContext({ children }) {
  // Automatic check karega ke local chal raha hai ya live
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  let serverUrl = isLocal 
    ? "http://localhost:8000" 
    : "https://fyp-virtual-tryon.vercel.app";

  return (
    <AuthDataContext.Provider value={{ serverUrl }}>
      {children}
    </AuthDataContext.Provider>
  );
}

export default AuthContext;