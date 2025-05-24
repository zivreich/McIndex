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

export type SortConfig = {
  column: 'country' | 'price' | 'trend' | null;
  order: 'asc' | 'desc' | null;
};

interface FiltersProps {
  timePeriodLabels: Record<number, string>;
  selectedTimePeriod: number;
  onTimePeriodChange: (period: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

export default function Filters({
  timePeriodLabels,
  selectedTimePeriod,
  onTimePeriodChange,
  searchTerm,
  onSearchChange,
  sortConfig,
  onSortChange,
}: FiltersProps) {

  const handleSortClick = () => {
    if (sortConfig.column !== 'price') {
      // If not currently sorting by price, start with ascending
      onSortChange({ column: 'price', order: 'asc' });
    } else {
      // If currently sorting by price, cycle through asc -> desc -> none
      if (sortConfig.order === 'asc') {
        onSortChange({ column: 'price', order: 'desc' });
      } else if (sortConfig.order === 'desc') {
        onSortChange({ column: null, order: null });
      } else {
        onSortChange({ column: 'price', order: 'asc' });
      }
    }
  };

  const getSortIcon = () => {
    if (sortConfig.column === 'price') {
      switch (sortConfig.order) {
        case 'asc':
          return <ArrowUp className="h-4 w-4" />;
        case 'desc':
          return <ArrowDown className="h-4 w-4" />;
        default:
          return <ArrowUpDown className="h-4 w-4" />;
      }
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const getSortLabel = () => {
    if (sortConfig.column === 'price') {
      switch (sortConfig.order) {
        case 'asc':
          return 'Price (Low to High)';
        case 'desc':
          return 'Price (High to Low)';
        default:
          return 'Sort by Price';
      }
    }
    return 'Sort by Price';
  };

  const isActivePriceSort = sortConfig.column === 'price';

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
          variant={isActivePriceSort ? 'default' : 'outline'}
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
