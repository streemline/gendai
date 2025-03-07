import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { LanguageContext } from "../App";
import { type Language } from "@shared/i18n";

const languages: { value: Language; label: string }[] = [
  { value: "ru", label: "Русский" },
  { value: "uk", label: "Українська" },
  { value: "cs", label: "Čeština" }
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.value}
          variant={language === lang.value ? "default" : "outline"}
          onClick={() => setLanguage(lang.value)}
          className="w-24"
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
}