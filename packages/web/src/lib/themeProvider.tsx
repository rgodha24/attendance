import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: getSystemTheme(),
  setTheme: () => null,
};

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = getSystemTheme(),
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    const switcher = document.getElementById("themeSwitcher");

    // @ts-expect-error view transitions
    if (!document.startViewTransition || !switcher) {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      return;
    }

    // @ts-expect-error view transitions
    const transition = document.startViewTransition(() => {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    });

    const rect = switcher.getBoundingClientRect();
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    /**
     * Credit to [@hooray](https://github.com/hooray)
     * @see https://github.com/vuejs/vitepress/pull/2347
     */
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      root.animate(
        {
          clipPath: theme === "dark" ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: "ease-in",
          pseudoElement:
            theme === "dark"
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
        }
      );
    }, [theme]);
  });

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
