import { cn } from "@/lib/utils";

interface Filter {
  id: string;
  name: string;
  style: string;
  preview: string;
}

// Cinematic filter names - no playful names
const FILTERS: Filter[] = [
  { id: "none", name: "Natural", style: "", preview: "bg-neutral-500" },
  { id: "film", name: "Film", style: "saturate-90 contrast-105 sepia-[.1]", preview: "bg-amber-800" },
  { id: "noir", name: "Noir", style: "grayscale contrast-125", preview: "bg-neutral-900" },
  { id: "warm", name: "Warm", style: "saturate-110 sepia-[.15] brightness-105", preview: "bg-orange-700" },
  { id: "cool", name: "Cool", style: "saturate-90 hue-rotate-[10deg] brightness-105", preview: "bg-blue-700" },
  { id: "fade", name: "Fade", style: "brightness-110 contrast-85 saturate-85", preview: "bg-neutral-400" },
  { id: "dramatic", name: "Dramatic", style: "contrast-130 saturate-120 brightness-90", preview: "bg-neutral-800" },
  { id: "muted", name: "Muted", style: "saturate-70 brightness-105", preview: "bg-neutral-600" },
];

interface CameraFiltersProps {
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
}

const CameraFilters = ({ selectedFilter, onFilterChange }: CameraFiltersProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 py-3">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
          onClick={() => onFilterChange(filter.id)}
        >
          <div
            className={cn(
              "w-14 h-14 rounded-lg transition-all",
              filter.preview,
              selectedFilter === filter.id
                ? "ring-2 ring-foreground/50 ring-offset-2 ring-offset-background"
                : ""
            )}
          />
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            selectedFilter === filter.id ? "text-foreground" : "text-muted-foreground"
          )}>
            {filter.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export const getFilterStyle = (filterId: string): string => {
  return FILTERS.find(f => f.id === filterId)?.style || "";
};

export default CameraFilters;
