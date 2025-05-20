"use client"

import type React from "react"
import { useState } from "react"
import { Check, ChevronsUpDown, DollarSign, Euro, PoundSterling, JapaneseYenIcon as Yen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useCurrency, type Currency } from "@/contexts/CurrencyContext"

const currencyIcons: Record<string, React.ReactNode> = {
  USD: <DollarSign className="h-4 w-4" />,
  EUR: <Euro className="h-4 w-4" />,
  GBP: <PoundSterling className="h-4 w-4" />,
  JPY: <Yen className="h-4 w-4" />,
}

interface CurrencySelectorProps {
  className?: string
}

export function CurrencySelector({ className }: CurrencySelectorProps) {
  const { selectedCurrency, setSelectedCurrency, availableCurrencies } = useCurrency()
  const [open, setOpen] = useState(false)

  const handleSelect = (currency: Currency) => {
    setSelectedCurrency(currency)
    setOpen(false)
  }

  const currentIcon = currencyIcons[selectedCurrency.code] || <DollarSign className="h-4 w-4" />

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[120px] justify-between font-mono", className)}
          aria-label="Select currency"
        >
          <span className="flex items-center gap-2">
            {currentIcon}
            {selectedCurrency.code}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {availableCurrencies.map((currency) => {
          const icon = currencyIcons[currency.code] || <DollarSign className="h-4 w-4" />
          return (
            <DropdownMenuItem
              key={currency.code}
              onSelect={() => handleSelect(currency)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                selectedCurrency.code === currency.code && "font-medium bg-accent",
              )}
            >
              {icon}
              <span>{currency.name}</span>
              {selectedCurrency.code === currency.code && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
