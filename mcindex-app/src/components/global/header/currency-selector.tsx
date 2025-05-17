"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, DollarSign, Euro, PoundSterling, JapaneseYenIcon as Yen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Define available currencies
export type Currency = {
  code: string
  symbol: string
  name: string
  icon: React.ReactNode
  conversionRate: number // Rate to convert from USD
}

export const currencies: Currency[] = [
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    icon: <DollarSign className="h-4 w-4" />,
    conversionRate: 1,
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    icon: <Euro className="h-4 w-4" />,
    conversionRate: 0.93,
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    icon: <PoundSterling className="h-4 w-4" />,
    conversionRate: 0.79,
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    icon: <Yen className="h-4 w-4" />,
    conversionRate: 150.27,
  },
]

interface CurrencySelectorProps {
  className?: string
}

export function CurrencySelector({ className }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0])
  const [open, setOpen] = useState(false)

  // Load saved currency preference from localStorage on component mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency")
    if (savedCurrency) {
      const currency = currencies.find((c) => c.code === savedCurrency)
      if (currency) {
        setSelectedCurrency(currency)
      }
    }
  }, [])

  // Handle currency selection
  const handleSelect = (currency: Currency) => {
    setSelectedCurrency(currency)
    localStorage.setItem("selectedCurrency", currency.code)
    setOpen(false)

    // Dispatch a custom event to notify other components about the currency change
    window.dispatchEvent(new CustomEvent("currencyChange", { detail: currency }))
  }

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
            {selectedCurrency.icon}
            {selectedCurrency.code}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onSelect={() => handleSelect(currency)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              selectedCurrency.code === currency.code && "font-medium bg-accent",
            )}
          >
            {currency.icon}
            <span>{currency.name}</span>
            {selectedCurrency.code === currency.code && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
