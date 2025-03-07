import { createContext, useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Statistics from "@/pages/statistics";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { translations, type Language } from "@shared/i18n";

export const LanguageContext = createContext<{
  t: typeof translations.en;
  language: Language;
  setLanguage: (lang: Language) => void;
}>({
  t: translations.en,
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

    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider
        value={{
          t: translations[language],
          language,
          setLanguage,
        }}
      >
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/statistics" component={Statistics} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </LanguageContext.Provider>
    </QueryClientProvider>
  );
}

export default App;