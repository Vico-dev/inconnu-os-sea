import { useEffect, useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, subDays, subYears } from 'date-fns'
import { fr } from 'date-fns/locale'

export type DateRange = {
  startDate: Date
  endDate: Date
  label: string
}

interface DateRangeSelectorProps {
  onDateRangeChange: (range: DateRange) => void
  currentRange: DateRange
  storageKey?: string // pour mémoriser la préférence par utilisateur
}

const PRESET_RANGES = [
  {
    label: '7 derniers jours',
    getRange: () => ({
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      label: '7 derniers jours'
    })
  },
  {
    label: '30 derniers jours',
    getRange: () => ({
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
      label: '30 derniers jours'
    })
  },
  {
    label: '90 derniers jours',
    getRange: () => ({
      startDate: subDays(new Date(), 90),
      endDate: new Date(),
      label: '90 derniers jours'
    })
  },
  {
    label: '1 an',
    getRange: () => ({
      startDate: subYears(new Date(), 1),
      endDate: new Date(),
      label: '1 an'
    })
  }
]

export function DateRangeSelector({ onDateRangeChange, currentRange, storageKey }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customStart, setCustomStart] = useState<string>("")
  const [customEnd, setCustomEnd] = useState<string>("")

  // Charger préférence sauvegardée
  useEffect(() => {
    if (!storageKey) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as { startDate: string; endDate: string; label: string }
        onDateRangeChange({ startDate: new Date(saved.startDate), endDate: new Date(saved.endDate), label: saved.label })
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  const handleRangeSelect = (range: DateRange) => {
    onDateRangeChange(range)
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(range)) } catch {}
    }
    setIsOpen(false)
  }

  const formatDateRange = (range: DateRange) => {
    const start = format(range.startDate, 'dd/MM/yyyy', { locale: fr })
    const end = format(range.endDate, 'dd/MM/yyyy', { locale: fr })
    return `${start} - ${end}`
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>{currentRange.label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {PRESET_RANGES.map((preset) => (
          <DropdownMenuItem
            key={preset.label}
            onClick={() => handleRangeSelect(preset.getRange())}
            className="cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{preset.label}</span>
              <span className="text-sm text-muted-foreground">
                {formatDateRange(preset.getRange())}
              </span>
            </div>
          </DropdownMenuItem>
        ))}

        <div className="px-3 py-2 border-t mt-1">
          <div className="text-xs text-muted-foreground mb-1">Personnalisé</div>
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!customStart || !customEnd}
              onClick={() => {
                const start = new Date(customStart)
                const end = new Date(customEnd)
                handleRangeSelect({ startDate: start, endDate: end, label: 'Personnalisé' })
              }}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 