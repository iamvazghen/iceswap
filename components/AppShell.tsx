"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

// Holds the desktop sidebar collapse state so both the rail and the main column
// react to it (main padding shrinks when the sidebar is hidden).
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("iceswap:sidebar") === "collapsed");
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("iceswap:sidebar", next ? "collapsed" : "open");
      return next;
    });

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main
        className={`flex-1 min-w-0 pt-16 lg:pt-0 transition-[padding] duration-300 ${
          collapsed ? "lg:pl-0" : "lg:pl-[260px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
