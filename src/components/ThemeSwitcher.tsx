import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Monitor, Globe, Check } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme, language, setLanguage, t } = useTheme();

  const themes = [
    { value: "light" as const, label: t("light"), icon: Sun },
    { value: "dark" as const, label: t("dark"), icon: Moon },
    { value: "system" as const, label: t("system"), icon: Monitor },
  ];

  const languages = [
    { value: "en" as const, label: t("english"), flag: "🇺🇸" },
    { value: "hi" as const, label: t("hindi"), flag: "🇮🇳" },
    { value: "es" as const, label: t("spanish"), flag: "🇪🇸" },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Theme Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuLabel className="text-xs">{t("theme")}</DropdownMenuLabel>
          {themes.map(({ value, label, icon: Icon }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              {theme === value && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuLabel className="text-xs">{t("language")}</DropdownMenuLabel>
          {languages.map(({ value, label, flag }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => setLanguage(value)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{flag}</span>
                {label}
              </span>
              {language === value && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
