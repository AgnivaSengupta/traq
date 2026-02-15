"use client";

import { useState } from "react";
import {
  SquareKanban, // For "Board"
  Calendar,
  TableProperties, // For "Applications" (List view)
  FileText, // For "Resumes"
  Settings,
  PanelLeftClose,
  PanelLeft,
  Briefcase, // For "Job Offers" or similar
  LogOut,
  Sparkles,
  Triangle,
  HelpCircle,
  Sun,
  User,
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="flex h-screen w-12 shrink-0 flex-col items-center border-r border-gray-200 bg-[#F7F8FA] py-3 gap-4 select-none">
        <button
          onClick={() => setCollapsed(false)}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        {/* Minimized Logo */}
        <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-white text-xs font-bold shadow-sm">
          t
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-gray-200 bg-[#F7F8FA] text-gray-700 text-[13px] select-none font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 mb-2">
         {/* Logo mark - kept simple like your original */}
         <div className="flex h-5 w-5 items-center justify-center rounded bg-black text-white text-[10px] font-bold shadow-sm">
            t
         </div>
        <span className="font-semibold text-base text-gray-800">traq</span>
        <button
          onClick={() => setCollapsed(true)}
          className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-200 transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* SECTION 1: MAIN TRACKER */}
      {/* Kept the tight gap-0.5 from your original code */}
      <nav className="flex flex-col gap-0.5 px-2 mb-4">
        {/* Section Header Style Matches "Teams" */}
        <div className="px-2 pb-1 pt-2 text-xs font-medium text-gray-500">
          Tracker
        </div>
        
        <NavItem 
            icon={SquareKanban} 
            label="Board" 
            active={true} // Default active state
        />
        <NavItem 
            icon={TableProperties} 
            label="Applications" 
        />
        <NavItem 
            icon={Calendar} 
            label="Calendar" 
        />
      </nav>

      {/* SECTION 2: ASSETS */}
      <div className="flex flex-col px-3 gap-0.5">
        <div className="px-2 pb-1 text-xs font-medium text-gray-500">
          Assets
        </div>

        {/* Removed hierarchy tree lines, just clean list */}
        <NavItem icon={FileText} label="Resumes" />
        <NavItem icon={Briefcase} label="Offers & Contracts" />
        <NavItem icon={Sparkles} label="AI Insights" iconColor="text-purple-600" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* USER & SETTINGS */}
      <div className="flex flex-col gap-0.5 px-2 py-2">
        <NavItem 
            icon={Settings} 
            label="Settings" 
        />
        {/* Modified Favorites style for User Profile */}
         <div className="group flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer transition-colors text-gray-600 hover:bg-gray-200/50">
            <User className="h-4 w-4 shrink-0 text-gray-500" />
            <span>Agniva</span>
            <LogOut className="ml-auto h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
         </div>
      </div>

      {/* Footer - Kept Exactly as Original */}
      <div className="flex items-center gap-1 border-t border-gray-200 px-3 py-2 text-gray-400 mt-2">
        <button className="p-1 hover:text-gray-600 transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        <div className="flex bg-gray-200/50 rounded-full p-0.5">
          <button className="p-0.5 rounded-full bg-white shadow-sm text-gray-600">
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button className="p-0.5 rounded-full text-gray-400">
             {/* Moon icon placeholder */}
          </button>
        </div>
        
        <span className="ml-auto text-xs text-gray-400/80 font-mono">v1.0.0</span>
      </div>
    </aside>
  );
};

// Kept your EXACT NavItem component to preserve the visual style
function NavItem({
  icon: Icon,
  label,
  active,
  badge,
  iconColor,
}: {
  icon?: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
  iconColor?: string;
}) {
  return (
    <div
      className={`group flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer transition-colors ${
        active
          ? "bg-[#EAEBED] text-gray-900 font-medium"
          : "text-gray-600 hover:bg-gray-200/50"
      }`}
    >
      {Icon && (
        <Icon className={`h-4 w-4 shrink-0 ${iconColor || "text-gray-500"}`} />
      )}
      <span>{label}</span>
      {badge && (
        <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded px-1 bg-gray-200 text-[10px] font-medium text-gray-600">
          {badge}
        </span>
      )}
    </div>
  );
}

export default Sidebar;