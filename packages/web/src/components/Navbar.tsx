import { useTheme } from "@/lib/themeProvider";
// import { tokenAtom } from "@/token";
// import { useAtom } from "jotai";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Navbar = () => {
  // const [token, setToken] = useAtom(tokenAtom);
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-[10%] bg-background">
      <div className="flex justify-between items-center px-4 h-full">
        <h1 className="text-4xl text-primary">
          <Link to="/">BROPHY ATTENDANCE {import.meta.env.DEV && "(dev)"}</Link>
        </h1>
        <div className="">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
            }}
            id="themeSwitcher"
            aria-label="theme switcher"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </div>
  );
};
