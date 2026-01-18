import { createContext, useContext, useState, ReactNode } from "react";

interface PageContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Dashboard");

  return (
    <PageContext.Provider value={{ title, setTitle }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageTitle(newTitle?: string) {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageProvider");
  }
  
  if (newTitle !== undefined && context.title !== newTitle) {
    context.setTitle(newTitle);
  }
  
  return context;
}
