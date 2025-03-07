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
import Register from "@/pages/register";

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
      <Route path="/register" component={Register} />
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

export default App;ations.en,
  language: "en",
  setLanguage: () => {},
});

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, navigate] = useLocation();

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  // When language changes, save to localStorage
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [, navigate] = useLocation();
    
    useEffect(() => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
      }
    }, [navigate]);
    
    return isAuthenticated ? <>{children}</> : null;
  };

  return (
    <LanguageContext.Provider
      value={{
        t: translations[language],
        language,
        setLanguage,
      }}
    >
      <Toaster />
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/statistics">
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        </Route>
        <Route path="/">
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Route>
      </Switch>
    </LanguageContext.Provider>
  );
}

export default App;
