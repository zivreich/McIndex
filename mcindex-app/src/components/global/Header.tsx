import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Globe } from "lucide-react"
import { ThemeToggle } from "@/components/global/header/theme-toggle"
import { CurrencySelector } from "@/components/global/header/currency-selector"

export default function Header() {
    return (
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">McIndex</h1>
          <p className="text-muted-foreground">
            Comparing the price of a <u className="cursor-pointer font-semibold">Big Mac</u> across different countries (in USD)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/countries">
            <Button variant="outline" className="gap-2">
              <Globe className="h-4 w-4" />
              Countries
            </Button>
          </Link>
          <CurrencySelector />
          <ThemeToggle />
        </div>
      </header>
    )
}