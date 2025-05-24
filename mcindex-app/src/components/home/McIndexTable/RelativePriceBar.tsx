"use client";

import React, { useState, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RelativePriceBarProps {
  value: number | null;
  minPrice: number;
  maxPrice: number;
  currencySymbol: string;
  currencyCode: string;
  className?: string;
}

export function RelativePriceBar({
  value,
  minPrice,
  maxPrice,
  currencySymbol,
  currencyCode,
  className,
}: RelativePriceBarProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    setIsHovered(true);
    handleMouseMove(event);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (value === null || typeof value === 'undefined') {
    return (
      <div className={cn("flex items-center justify-center py-3", className)}>
        <span className="text-xs text-muted-foreground font-medium">N/A</span>
      </div>
    );
  }

  let percentage = 0;
  const range = maxPrice - minPrice;

  if (range === 0) {
    // If all values are the same
    if (value === minPrice && minPrice > 0) {
      percentage = 100; // All bars full if common value is positive
    } else if (value === minPrice && minPrice === 0) {
      percentage = 0; // All bars empty if common value is zero
    } else {
      percentage = 0; // Should not happen if value is part of the set
    }
  } else {
    percentage = ((value - minPrice) / range) * 100;
  }

  // Clamp percentage between 0 and 100
  percentage = Math.max(0, Math.min(100, percentage));

  const formattedValue = `${currencySymbol}${value.toFixed(2)}`;
  
  // Determine if this is a low, medium, or high price for styling
  const priceLevel = percentage < 33 ? 'low' : percentage < 67 ? 'medium' : 'high';

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={cn("w-full py-2 group cursor-pointer", className)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Price value display */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-foreground">
            {formattedValue}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {percentage.toFixed(0)}%
          </span>
        </div>
        
        {/* Modern progress bar */}
        <div className="relative w-full h-1.5 bg-muted/60 rounded-full overflow-hidden shadow-inner">
          {/* Background gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-muted/40 to-muted/80 rounded-full" />
          
          {/* Progress fill with gradient and animation */}
          <div
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out",
              "bg-gradient-to-r shadow-sm",
              // Color variations based on price level for subtle differentiation
              priceLevel === 'low' && "from-foreground/70 to-foreground/50",
              priceLevel === 'medium' && "from-foreground/80 to-foreground/60", 
              priceLevel === 'high' && "from-foreground/90 to-foreground/70",
              // Hover effects
              "group-hover:shadow-md group-hover:from-foreground/80 group-hover:to-foreground/60",
              "group-hover:scale-y-110 origin-left"
            )}
            style={{ width: `${percentage}%` }}
          />
          
          {/* Subtle highlight for premium feel */}
          <div
            className={cn(
              "absolute left-0 top-0 h-0.5 rounded-full transition-all duration-500 ease-out",
              "bg-gradient-to-r from-white/20 to-transparent",
              "group-hover:from-white/30"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Position indicator */}
        <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
          <span className="font-mono">Low</span>
          <span className="font-mono">High</span>
        </div>
      </div>

      {/* Custom floating tooltip that follows the mouse */}
      {isHovered && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${mousePosition.x + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
            top: `${mousePosition.y + (containerRef.current?.getBoundingClientRect().top || 0)}px`,
            transform: 'translate(-50%, -100%) translateY(-8px)',
          }}
        >
          <div className="relative bg-background/66 backdrop-blur-md border border-white/20 text-foreground shadow-2xl rounded-lg p-3 max-w-xs animate-in fade-in-0 zoom-in-95 overflow-hidden">
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-lg pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="relative z-10">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">{formattedValue} {currencyCode}</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Relative position:</span>
                    <span className="font-mono">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Range:</span>
                    <span className="font-mono">
                      {currencySymbol}{minPrice.toFixed(2)} - {currencySymbol}{maxPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
