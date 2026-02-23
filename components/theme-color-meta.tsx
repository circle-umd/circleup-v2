"use client";

import { useEffect } from "react";

export function ThemeColorMeta() {
  useEffect(() => {
    // Remove any existing theme-color meta tags
    const existing = document.querySelectorAll('meta[name="theme-color"]');
    existing.forEach((meta) => meta.remove());

    // Add light mode theme-color
    const lightMeta = document.createElement("meta");
    lightMeta.name = "theme-color";
    lightMeta.content = "#57687d";
    lightMeta.setAttribute("media", "(prefers-color-scheme: light)");
    document.head.appendChild(lightMeta);

    // Add dark mode theme-color
    const darkMeta = document.createElement("meta");
    darkMeta.name = "theme-color";
    darkMeta.content = "#2c3542";
    darkMeta.setAttribute("media", "(prefers-color-scheme: dark)");
    document.head.appendChild(darkMeta);
  }, []);

  return null;
}
