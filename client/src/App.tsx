import React, { useState, useCallback } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { translations, type Language } from "@shared/i18n";
import Home from "@/pages/home";
import Statistics from "@/pages/statistics";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

export const LanguageContext = React.createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.ru;
}>({
  language: "cs",
  setLanguage: () => {},
  t: translations.cs
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/statistics" component={Statistics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>("cs");

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang);
    // Принудительно обновляем состояние react-query чтобы обновить все компоненты
    queryClient.invalidateQueries();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider 
        value={{
          language,
          setLanguage: handleLanguageChange,
          t: translations[language]
        }}
      >
        <div className="min-h-screen bg-background">
          <Router />
          <Toaster />
        </div>
      </LanguageContext.Provider>
    </QueryClientProvider>
  );
}

export default App;