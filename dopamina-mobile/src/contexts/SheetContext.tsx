import React, { createContext, useContext, useState } from 'react';

type SheetName = 'ofertas' | 'perfil' | 'cart' | null;

interface SheetContextType {
  activeSheet: SheetName;
  openSheet: (name: SheetName) => void;
  closeSheet: () => void;
  tabBarVisible: boolean;
  setTabBarVisible: (v: boolean) => void;
}

const SheetContext = createContext<SheetContextType>({
  activeSheet: null,
  openSheet: () => {},
  closeSheet: () => {},
  tabBarVisible: true,
  setTabBarVisible: () => {},
});

export function useSheet() {
  return useContext(SheetContext);
}

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [activeSheet, setActiveSheet] = useState<SheetName>(null);
  const [tabBarVisible, setTabBarVisible] = useState(true);

  return (
    <SheetContext.Provider
      value={{
        activeSheet,
        openSheet: (name) => setActiveSheet(name),
        closeSheet: () => setActiveSheet(null),
        tabBarVisible,
        setTabBarVisible,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}
