"use client";

import { useState } from "react";
import {
  Search,
  Inbox,
  CircleDot, // For "My issues"
  ChevronDown,
  ChevronRight,
  SquareKanban, // For "Board"
  Calendar,
  ListTodo, // For "Backlog"
  Archive,
  FolderOpen,
  LayoutTemplate, // For "Views"
  HelpCircle,
  Sun,
  PanelLeftClose,
  PanelLeft,
  Sprout, // For MSP Launch
  CircleDashed, // For Issues
  RotateCw, // For Sprints
  Layers, // For Projects
  Sparkles, // For V1.0
  Triangle, // For Landing Page
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
        <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-400 text-black text-xs font-bold shadow-sm">
          <div className="grid grid-cols-2 gap-[1px]">
            <div className="bg-black h-1 w-1 rounded-[1px]"></div>
            <div className="bg-black/30 h-1 w-1 rounded-[1px]"></div>
            <div className="bg-black/30 h-1 w-1 rounded-[1px]"></div>
            <div className="bg-black h-1 w-1 rounded-[1px]"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-gray-200 bg-[#F7F8FA] text-gray-700 text-[13px] select-none font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-yellow-400 text-black text-xs font-bold shadow-sm">
          <div className="grid grid-cols-2 gap-[1px]">
            <div className="bg-black h-1 w-1 rounded-[1px]"></div>
            <div className="bg-black/30 h-1 w-1 rounded-[1px]"></div>
            <div className="bg-black/30 h-1 w-1 rounded-[1px]"></div>
            <div className="bg-black h-1 w-1 rounded-[1px]"></div>
          </div>
        </div>
        <span className="font-semibold text-sm text-gray-800">Brandby</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        <button
          onClick={() => setCollapsed(true)}
          className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-200 transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 mb-2">
        <div className="flex items-center gap-2 rounded-md bg-white border border-gray-200 shadow-sm px-2.5 py-1.5 text-gray-400 group cursor-text hover:border-gray-300 transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span className="text-gray-500">Search...</span>
          <div className="ml-auto flex h-4 w-4 items-center justify-center rounded border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-400 font-mono group-hover:border-gray-300">
            /
          </div>
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="flex flex-col gap-0.5 px-2 mb-4">
        <NavItem icon={Inbox} label="Inbox" />
        <NavItem icon={CircleDot} label="My issues" />
      </nav>

      {/* Teams Section */}
      <div className="flex flex-col px-3 gap-0.5">
        <div className="px-2 pb-1 text-xs font-medium text-gray-500">
          Teams
        </div>

        {/* Team: MSP Launch */}
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-800 font-medium hover:bg-gray-200/50 rounded-md cursor-pointer mb-0.5">
          <Sprout className="h-3.5 w-3.5 text-green-600" />
          <span>MSP Launch</span>
          <ChevronDown className="ml-auto h-3 w-3 text-gray-400" />
        </div>

        {/* Hierarchy Tree */}
        <div className="relative pl-2.5 ml-2.5 border-l border-gray-200/80 space-y-0.5">
          
          {/* Sub-group: Issues */}
          <div className="relative">
            <NavItem icon={CircleDashed} label="Issues" />
            
            {/* Nested under Issues */}
            <div className="relative pl-5 pt-0.5 flex flex-col gap-0.5">
               {/* Vertical line specifically for this sub-list */}
               <div className="absolute left-[9px] top-0 bottom-2 w-px bg-gray-200/80" />
               
               <NavItem label="Board" active />
               <NavItem label="Calendar" />
               <NavItem label="Backlog" />
            </div>
          </div>

          {/* Sub-group: Sprints */}
          <div className="relative mt-1">
            <NavItem icon={RotateCw} label="Sprints" />
            
            <div className="relative pl-5 pt-0.5 flex flex-col gap-0.5">
               <div className="absolute left-[9px] top-0 bottom-2 w-px bg-gray-200/80" />
               <NavItem label="Current" badge="2" />
               <NavItem label="Upcoming" />
               <NavItem label="Completed" />
            </div>
          </div>

          {/* Other items in MSP Launch */}
          <NavItem icon={Layers} label="Projects" />
          <NavItem icon={LayoutTemplate} label="Views" />

        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Favorites / Projects */}
      <div className="flex flex-col gap-0.5 px-2 py-2">
        <NavItem 
          icon={Sparkles} 
          iconColor="text-purple-600"
          label="V1.0" 
        />
        <NavItem 
          icon={Triangle} 
          iconColor="text-orange-500 fill-orange-500" // filled triangle
          label="Landing Page" 
        />
      </div>

      {/* Footer */}
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
                 {/* Moon icon usually goes here, obscured in image */}
            </button>
         </div>
        
        <span className="ml-auto text-xs text-gray-400/80 font-mono">v1.00-20-002-03</span>
      </div>
    </aside>
  );
};

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