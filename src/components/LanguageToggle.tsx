
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      className="w-10 h-10"
    >
      <Globe className="h-4 w-4" />
    </Button>
  );
}
