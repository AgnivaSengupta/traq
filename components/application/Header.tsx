"use client"

// import React, { useState } from "react";
const TABS = ['All', 'Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'];

interface Props {
  tabs: string[];
  activetab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({tabs, activetab, onTabChange} : Props) {
  
  return (
    <div className="p-1 bg-muted/40 rounded-xl mb-4 border border-border mx-2 mt-2">
      <div className="relative flex items-center w-full">
        <div
          className="absolute left-0 top-0 bottom-0 rounded-lg bg-background shadow-sm border border-border transition-transform duration-300 ease-in-out pointer-events-none"
          style={{
            width: `${100 / TABS.length}%`,
            transform: `translateX(${TABS.indexOf(activetab) * 100}%)`
          }}
        />
        {tabs.map((tab) => {
          const isActive = activetab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative z-10 flex-1 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer ${isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  )
}