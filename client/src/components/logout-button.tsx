
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { useContext } from "react";
import { LanguageContext } from "@/App";
import { queryClient } from "@/lib/queryClient";

export function LogoutButton() {
  const { t } = useContext(LanguageContext);
  const [, navigate] = useLocation();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    
    // Clear any cached queries
    queryClient.clear();
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      <LogOut className="h-4 w-4 mr-2" />
      {t.auth.logout}
    </Button>
  );
}
