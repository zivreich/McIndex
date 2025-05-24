"use client"

import { Search, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type SortOrder = 'asc' | 'desc' | 'none';

interface FiltersProps {
  timePeriodLabels: Record<number, string>;
  selectedTimePeriod: number;
  onTimePeriodChange: (period: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

export default function Filters({
  timePeriodLabels,
  selectedTimePeriod,
  onTimePeriodChange,
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
}: FiltersProps) {

  const handleSortClick = () => {
    const nextOrder: SortOrder = sortOrder === 'none' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'none';
    onSortChange(nextOrder);
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'asc':
        return <ArrowUp className="h-4 w-4" />;
      case 'desc':
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'asc':
        return 'Price (Low to High)';
      case 'desc':
        return 'Price (High to Low)';
      default:
        return 'Sort by Price';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search countries..."
            className="pl-8 font-mono"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Time Period Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="font-mono flex items-center gap-2 whitespace-nowrap"
            >
              <Calendar className="h-4 w-4" />
              Compare to {timePeriodLabels[selectedTimePeriod]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.keys(timePeriodLabels).map((yearString) => {
              const year = parseInt(yearString, 10);
              return (
                <DropdownMenuItem
                  key={year}
                  onClick={() => onTimePeriodChange(year)}
                >
                  {timePeriodLabels[year]}
                  {selectedTimePeriod === year && (
                    <Badge className="ml-2 bg-primary">Selected</Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={sortOrder !== 'none' ? 'default' : 'outline'}
          className="font-mono flex items-center gap-2 whitespace-nowrap"
          onClick={handleSortClick}
        >
          {getSortLabel()}
          {getSortIcon()}
        </Button>
      </div>
    </div>
  );
}
