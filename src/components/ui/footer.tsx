"use client";

import { Sun, Moon, ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center rounded-full border border-dotted border-white/20 bg-[#121214]/80 p-1 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-label="Light mode"
          className="mr-3 rounded-full bg-zinc-800 p-2 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <Sun className="h-4 w-4" strokeWidth={1.5} />
          <span className="sr-only">Light</span>
        </button>

        <button 
          type="button" 
          onClick={handleScrollTop}
          aria-label="Scroll to top"
          className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          <span className="sr-only">Top</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-label="Dark mode"
          className="ml-3 rounded-full bg-zinc-800 p-2 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <Moon className="h-4 w-4" strokeWidth={1.5} />
          <span className="sr-only">Dark</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;

