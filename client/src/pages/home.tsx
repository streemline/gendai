import { LanguageSwitcher } from "@/components/language-switcher";
import { WorkEntryForm } from "@/components/work-entry-form";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Work Time Tracking</h1>
          <p className="text-sm text-gray-600">GENDAI s.r.o.</p>
        </div>
        <Link href="/statistics">
          <Button variant="outline">
            <BarChart className="w-4 h-4 mr-2" />
            Statistics
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <WorkEntryForm />
      </div>
    </div>
  );
}
