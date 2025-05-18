"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { ArrowUpDown } from "lucide-react"
import { useState } from "react"

// Define time period types for type safety
type TimePeriod = "3m" | "6m" | "1y" | "2y";

// Format time period labels for display
const timePeriodLabels: Record<TimePeriod, string> = {
    "3m": "3 months ago",
    "6m": "6 months ago",
    "1y": "1 year ago",
    "2y": "2 years ago",
}

export default function Filters() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>("3m")

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
            onChange={(e) => setSearchTerm(e.target.value)}
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
            <DropdownMenuItem onClick={() => setSelectedTimePeriod("3m")}>
              3 months ago
              {selectedTimePeriod === "3m" && (
                <Badge className="ml-2 bg-primary">Selected</Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedTimePeriod("6m")}>
              6 months ago
              {selectedTimePeriod === "6m" && (
                <Badge className="ml-2 bg-primary">Selected</Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedTimePeriod("1y")}>
              1 year ago
              {selectedTimePeriod === "1y" && (
                <Badge className="ml-2 bg-primary">Selected</Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedTimePeriod("2y")}>
              2 years ago
              {selectedTimePeriod === "2y" && (
                <Badge className="ml-2 bg-primary">Selected</Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="font-mono flex items-center gap-2"
        >
          Sort by Price
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
