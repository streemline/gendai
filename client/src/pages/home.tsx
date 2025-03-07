
import { useContext } from "react";
import { LanguageContext } from "../App";
import { LanguageSwitcher } from "@/components/language-switcher";
import { WorkEntryForm } from "@/components/work-entry-form";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default function Home() {
  const { t } = useContext(LanguageContext);
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Work Time Tracking</h1>
          <p className="text-sm text-gray-600">GENDAI s.r.o.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/statistics">
            <Button variant="outline">
              <BarChart className="w-4 h-4 mr-2" />
              {t.navigation.statistics}
            </Button>
          </Link>
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <WorkEntryForm />
      </div>
    </div>
  );
}
