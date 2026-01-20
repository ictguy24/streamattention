import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  filled?: boolean;
}

export const CompanionsIcon = ({ className, filled }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {filled ? (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
        <circle cx="17" cy="11" r="2" fill="currentColor" />
      </>
    ) : (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    )}
  </svg>
);

export default CompanionsIcon;
