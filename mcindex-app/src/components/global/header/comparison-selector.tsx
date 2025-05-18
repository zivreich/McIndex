"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Define Big Mac options
type BigMacOption = {
  id: string;
  name: string;
  description: string;
};

const bigMacOptions: BigMacOption[] = [
  {
    id: "big-mac",
    name: "Big Mac",
    description: "Classic McDonald's burger",
  },
  {
    id: "coffee-cup",
    name: "Coffee Cup",
    description: "Regular brewed coffee",
  },
  {
    id: "nuggets-10pcs",
    name: "10 Piece McNuggets",
    description: "10 chicken nuggets",
  },
  {
    id: "beer",
    name: "Beer",
    description: "Standard beer (where available)",
  },
  {
    id: "bread",
    name: "Loaf of Bread",
    description: "Basic white or wheat loaf",
  },
  {
    id: "milk",
    name: "Liter of Milk",
    description: "1L whole or low-fat milk",
  },
  {
    id: "coca-cola",
    name: "Coca-Cola (500ml)",
    description: "500ml bottled Coke",
  },
];

export default function ComparisonSelector() {
  const [selectedBigMac, setSelectedBigMac] = useState<BigMacOption>(
    bigMacOptions[0]
  );
  const [open, setOpen] = useState(false);

  const handleSelect = (option: BigMacOption) => {
    setSelectedBigMac(option);
    setOpen(false);

    // Dispatch an event to notify other components about the Big Mac change
    window.dispatchEvent(new CustomEvent("bigMacChange", { detail: option }));
  };

  return (
    <p className="text-muted-foreground">
      Comparing the price of a
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <u className="cursor-pointer font-semibold hover:underline-offset-4 transition-all inline-flex items-center gap-1 px-2">
            {selectedBigMac.name}
            <ChevronsUpDown className="h-3 w-3 opacity-70" />
          </u>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[220px]">
          {bigMacOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => handleSelect(option)}
              className={cn(
                "flex flex-col items-start gap-1 cursor-pointer",
                selectedBigMac.id === option.id && "font-medium bg-accent"
              )}
            >
              <div className="flex w-full items-center">
                <span className="font-medium">{option.name}</span>
                {selectedBigMac.id === option.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      across different countries (in USD)
    </p>
  );
}
