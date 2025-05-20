import { Search } from "lucide-react"
import { Input } from "./input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { DatePicker } from "./date-picker"

interface FilterProps {
  searchPlaceholder?: string
  onSearchChange: (value: string) => void
  statusOptions?: { value: string; label: string }[]
  onStatusChange?: (value: string) => void
  showDateRange?: boolean
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
}

export function Filter({
  searchPlaceholder = "Search...",
  onSearchChange,
  statusOptions,
  onStatusChange,
  showDateRange = false,
  onStartDateChange,
  onEndDateChange,
}: FilterProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          className="pl-8"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {statusOptions && onStatusChange && (
        <Select onValueChange={onStatusChange} defaultValue="">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {showDateRange && onStartDateChange && onEndDateChange && (
        <div className="flex items-center gap-2">
          <DatePicker
            date={undefined}
            onSelect={onStartDateChange}
          />
          <span className="text-muted-foreground">to</span>
          <DatePicker
            date={undefined}
            onSelect={onEndDateChange}
          />
        </div>
      )}
    </div>
  )
} 