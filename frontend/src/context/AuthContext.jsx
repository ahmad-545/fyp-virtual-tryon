import { createContext } from "react";

export const AuthDataContext = createContext();

function AuthContext({ children }) {
  // Aapka backend ka URL yahan define hoga
  let serverUrl = "http://localhost:8000"; 

  return (
    <AuthDataContext.Provider value={{ serverUrl }}>
      {children}
    </AuthDataContext.Provider>
  );
}

export default AuthContext;