import { useState, useEffect, useRef } from 'react'
import { format, parse } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { TrafficDetails } from './components/traffic-details'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'

export default function Dashboard() {
  // Keep track of popover state
  const [open, setOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Function to parse date from URL
  const parseDateFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlDate = urlParams.get('date')

    if (urlDate) {
      try {
        // Parse date from URL (format: 'yyyy-MM-dd')
        const parsedDate = parse(urlDate, 'yyyy-MM-dd', new Date())
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate
        }
      } catch (e) {
        console.error('Error parsing date from URL', e)
      }
    }

    return new Date() // Default to today
  }

  // Default to current date or URL parameter
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(parseDateFromUrl())

  // Keep the selected month in sync with the selectedDate
  const [currentMonth, setCurrentMonth] = useState<Date | undefined>(selectedDate)

  // Update URL when date changes
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      // Update URL without reloading the page
      const url = new URL(window.location.href)
      url.searchParams.set('date', formattedDate)
      window.history.replaceState({}, '', url)

      // Also update current month when date changes
      setCurrentMonth(selectedDate)
    }
  }, [selectedDate])

  // Listen for URL changes (browser back/forward buttons or manual URL edits)
  useEffect(() => {
    const handleUrlChange = () => {
      const dateFromUrl = parseDateFromUrl()
      const currentFormatted = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
      const urlFormatted = format(dateFromUrl, 'yyyy-MM-dd')

      // Only update if the date has actually changed
      if (currentFormatted !== urlFormatted) {
        setSelectedDate(dateFromUrl)
        setCurrentMonth(dateFromUrl)
      }
    }

    // Add event listener for popstate (back/forward buttons)
    window.addEventListener('popstate', handleUrlChange)

    // Also check when component mounts
    handleUrlChange()

    // Clean up
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
    }
  }, [selectedDate])

  // Format the date to string (YYYY-MM-DD)
  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd')
  }

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    setOpen(false) // Close the popover after selection
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>

        {/* Date Picker Filter Component */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='text-lg font-medium'>Traffic Data Overview</div>
          <div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" ref={calendarRef}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  defaultMonth={selectedDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Histogram Chart */}
        <div className='grid grid-cols-1 gap-4'>
          <Card className='col-span-1'>
            <CardHeader>
              <CardTitle>Traffic Data</CardTitle>
            </CardHeader>
            <CardContent className='pl-2'>
              <Overview selectedDate={formatDate(selectedDate)} />
            </CardContent>
          </Card>

          {/* Detailed Traffic Analysis */}
          <Card className='col-span-1'>
            <CardHeader>
              <CardTitle>Detailed Traffic Analysis</CardTitle>
            </CardHeader>
            <CardContent className='pl-2'>
              <TrafficDetails selectedDate={formatDate(selectedDate)} />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
