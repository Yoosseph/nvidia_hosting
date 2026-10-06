"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    let preference: string | null = null;
    try { preference = localStorage.getItem("nim-theme"); } catch { /* Use the system theme when storage is unavailable. */ }
    const initial = preference === "light" || preference === "dark"
      ? preference
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try { localStorage.setItem("nim-theme", next); } catch { /* Switching themes still works without storage. */ }
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return <button className="icon-button" type="button" onClick={toggle} aria-label={label} title={label}>
    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
  </button>;
}
