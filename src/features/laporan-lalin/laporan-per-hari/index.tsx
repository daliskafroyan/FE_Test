import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { TrafficTable } from '../components/traffic-table'

export default function LaporanPerHari() {
  // Get date from URL if available
  const parseDateFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlDate = urlParams.get('date')

    if (urlDate) {
      try {
        const parsedDate = new Date(urlDate)
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate
        }
      } catch (e) {
        console.error('Error parsing date from URL', e)
      }
    }

    return undefined
  }

  const [date, setDate] = useState<Date | undefined>(parseDateFromUrl())
  const [open, setOpen] = useState(false)

  // Update URL when date changes
  useEffect(() => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      // Update URL without reloading the page
      const url = new URL(window.location.href)
      url.searchParams.set('date', formattedDate)
      window.history.replaceState({}, '', url)
    }
  }, [date])

  const handleDateChange = (date: Date | undefined) => {
    setDate(date)
    setOpen(false) // Close the popover after selection
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pilih Tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <TrafficTable date={date?.toISOString().split('T')[0]} />
    </div>
  )
}
