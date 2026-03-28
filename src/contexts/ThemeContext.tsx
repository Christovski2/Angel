import { createContext, useContext, ReactNode } from "react";

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return <ThemeContext.Provider value={{}}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
