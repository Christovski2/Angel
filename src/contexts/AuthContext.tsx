import { createContext, useContext, ReactNode, useState } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Имитируем, что пользователь залогинен
  const [user] = useState({ id: "1", name: "Admin" });
  const [isLoading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, isLoading, timedOut: false, retryAuth: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
