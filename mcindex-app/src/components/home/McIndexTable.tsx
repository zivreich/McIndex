import Filters, { type SortOrder } from "@/components/home/McIndexTable/Filters";
import McIndexContent from "@/components/home/McIndexTable/McIndexContent";
import { useState } from "react";

// Format time period labels for display
export const timePeriodLabels: Record<number, string> = {
    2025: "2025",
    2024: "2024",
    2023: "2023",
    2022: "2022",
    2021: "2021",
};

export default function McIndexTable() {
    // State lifted from Filters.tsx
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<number>(2025);
    // Search state for filtering
    const [searchTerm, setSearchTerm] = useState<string>("");
    // Sort state for price sorting
    const [sortOrder, setSortOrder] = useState<SortOrder>('none');

    return (
        <div>
            <Filters
                timePeriodLabels={timePeriodLabels}
                selectedTimePeriod={selectedTimePeriod}
                onTimePeriodChange={setSelectedTimePeriod}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
            />
            <McIndexContent
                timePeriodLabels={timePeriodLabels}
                selectedTimePeriod={selectedTimePeriod}
                searchTerm={searchTerm}
                sortOrder={sortOrder}
            />    
        </div>
    )
}