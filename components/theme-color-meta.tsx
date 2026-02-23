"use client";

import { useEffect } from "react";

export function ThemeColorMeta() {
  useEffect(() => {
    // Remove any existing theme-color meta tags
    const existing = document.querySelectorAll('meta[name="theme-color"]');
    existing.forEach((meta) => meta.remove());

    // Add theme-color matching the sky color
    const themeMeta = document.createElement("meta");
    themeMeta.name = "theme-color";
    themeMeta.content = "#3B4653";
    document.head.appendChild(themeMeta);
  }, []);

  return null;
}
