import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Filter {
  id: string;
  name: string;
  style: string;
  preview: string;
}

const FILTERS: Filter[] = [
  { id: "none", name: "Normal", style: "", preview: "bg-gradient-to-br from-gray-400 to-gray-600" },
  { id: "neon", name: "Neon Glow", style: "saturate-150 contrast-110 hue-rotate-15", preview: "bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500" },
  { id: "vintage", name: "Vintage", style: "sepia-[.35] contrast-95 brightness-95", preview: "bg-gradient-to-br from-amber-700 to-orange-900" },
  { id: "bw", name: "B&W", style: "grayscale contrast-110", preview: "bg-gradient-to-br from-gray-900 to-white" },
  { id: "warm", name: "Warm Sunset", style: "saturate-110 sepia-[.15] brightness-105", preview: "bg-gradient-to-br from-orange-400 to-red-500" },
  { id: "cool", name: "Cool Breeze", style: "saturate-90 hue-rotate-[20deg] brightness-105", preview: "bg-gradient-to-br from-cyan-400 to-blue-500" },
  { id: "dramatic", name: "Dramatic", style: "contrast-125 saturate-125 brightness-90", preview: "bg-gradient-to-br from-slate-900 to-slate-700" },
  { id: "soft", name: "Soft Glow", style: "brightness-110 contrast-90 saturate-90", preview: "bg-gradient-to-br from-rose-200 to-pink-300" },
];

interface CameraFiltersProps {
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
}

const CameraFilters = ({ selectedFilter, onFilterChange }: CameraFiltersProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 py-3">
      {FILTERS.map((filter, index) => (
        <motion.button
          key={filter.id}
          className="flex flex-col items-center gap-1.5 shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onFilterChange(filter.id)}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-2xl border-2 transition-all",
              filter.preview,
              selectedFilter === filter.id
                ? "border-primary scale-110"
                : "border-transparent"
            )}
          />
          <span className={cn(
            "text-[10px] font-medium",
            selectedFilter === filter.id ? "text-primary" : "text-muted-foreground"
          )}>
            {filter.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export const getFilterStyle = (filterId: string): string => {
  return FILTERS.find(f => f.id === filterId)?.style || "";
};

export default CameraFilters;
