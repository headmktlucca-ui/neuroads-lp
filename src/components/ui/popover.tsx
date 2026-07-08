import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

export const Popover: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger: React.FC<{ children: React.ReactElement<any>; asChild?: boolean }> = ({ children }) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used within Popover");

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      if ((children.props as any).onClick) (children.props as any).onClick(e);
      context.setOpen(!context.open);
    }
  });
};

export const PopoverContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used within Popover");

  if (!context.open) return null;

  return (
    <div className={cn("absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 rounded-md border border-slate-200 bg-white p-4 shadow-md outline-none", className)}>
      {children}
    </div>
  );
};
