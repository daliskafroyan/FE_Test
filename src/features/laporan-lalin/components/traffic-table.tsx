import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Search, Download } from 'lucide-react'
import { useTrafficData, TrafficItem } from '@/api/traffic'
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TrafficTable({ date }: { date?: string }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [sortField, setSortField] = useState<string>('ruas')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [activeTab, setActiveTab] = useState('total-e-toll')

    // Query params
    const queryParams = {
        tanggal: date,
        page: currentPage,
        limit: itemsPerPage
    }

    const { data: trafficResponse, isLoading } = useTrafficData(queryParams)

    // Group traffic data by Ruas and Gerbang
    const processTrafficData = () => {
        if (!trafficResponse?.data?.rows?.rows) return []

        const data = [...trafficResponse.data.rows.rows]

        // Create a map to group by Ruas (IdCabang) and Gerbang (IdGerbang)
        const groupedData = new Map()

        data.forEach(item => {
            const key = `${item.IdCabang}-${item.IdGerbang}`
            if (!groupedData.has(key)) {
                groupedData.set(key, {
                    ruas: item.IdCabang,
                    gerbang: item.IdGerbang,
                    gardu: item.IdGardu,
                    hari: getDay(item.Tanggal),
                    tanggal: formatDate(item.Tanggal),
                    metode: "E-Toll", // Simplified for example
                    gol1: 0,
                    gol2: 0,
                    gol3: 0,
                    gol4: 0,
                    gol5: 0,
                    total: 0
                })
            }

            // Increment based on Golongan
            const entry = groupedData.get(key)

            // Count based on Golongan (simplified example)
            if (item.Golongan === 1) entry.gol1 += countTransactions(item)
            else if (item.Golongan === 2) entry.gol2 += countTransactions(item)
            else if (item.Golongan === 3) entry.gol3 += countTransactions(item)
            else if (item.Golongan === 4) entry.gol4 += countTransactions(item)
            else if (item.Golongan === 5) entry.gol5 += countTransactions(item)

            // Update total
            entry.total = entry.gol1 + entry.gol2 + entry.gol3 + entry.gol4 + entry.gol5
        })

        return Array.from(groupedData.values())
    }

    // Count total transactions in a traffic item
    const countTransactions = (item: TrafficItem): number => {
        // Use appropriate fields based on active tab
        if (activeTab === 'total-tunai') {
            return item.Tunai
        } else if (activeTab === 'total-e-toll') {
            return item.eMandiri + item.eBri + item.eBni + item.eBca
        } else if (activeTab === 'total-flo') {
            return item.eFlo
        } else if (activeTab === 'total-ktp') {
            return item.DinasOpr + item.DinasMitra + item.DinasKary
        } else if (activeTab === 'total-keseluruhan') {
            return item.Tunai + item.DinasOpr + item.DinasMitra + item.DinasKary +
                item.eMandiri + item.eBri + item.eBni + item.eBca +
                item.eNobu + item.eDKI + item.eMega + item.eFlo
        } else {
            // Combined e-toll, tunai, flo
            return item.Tunai + item.eMandiri + item.eBri + item.eBni + item.eBca + item.eFlo
        }
    }

    // Format date from API to display format
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
    }

    // Get day name from date
    const getDay = (dateString: string): string => {
        const date = new Date(dateString)
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        return days[date.getDay()]
    }

    // Filter and sort the data
    const getFilteredSortedData = () => {
        const processedData = processTrafficData()

        // Filter by search term
        const filtered = processedData.filter(item =>
            item.ruas.toString().includes(searchTerm) ||
            item.gerbang.toString().includes(searchTerm) ||
            item.hari.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tanggal.includes(searchTerm)
        )

        // Sort the data
        return filtered.sort((a, b) => {
            let aValue = a[sortField]
            let bValue = b[sortField]

            // Handle numeric fields
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }

            // Handle string fields
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue)
            }

            return 0
        })
    }

    // Get current page data
    const getCurrentPageData = () => {
        const sortedData = getFilteredSortedData()
        const startIndex = (currentPage - 1) * itemsPerPage
        return sortedData.slice(startIndex, startIndex + itemsPerPage)
    }

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    // Calculate totals for each columns
    const calculateTotals = () => {
        const data = getFilteredSortedData()

        return {
            gol1: data.reduce((sum, item) => sum + item.gol1, 0),
            gol2: data.reduce((sum, item) => sum + item.gol2, 0),
            gol3: data.reduce((sum, item) => sum + item.gol3, 0),
            gol4: data.reduce((sum, item) => sum + item.gol4, 0),
            gol5: data.reduce((sum, item) => sum + item.gol5, 0),
            total: data.reduce((sum, item) => sum + item.total, 0)
        }
    }

    // Calculate totals by Ruas
    const calculateTotalsByRuas = () => {
        const data = getFilteredSortedData()
        const ruasMap = new Map()

        // Group by ruas
        data.forEach(item => {
            if (!ruasMap.has(item.ruas)) {
                ruasMap.set(item.ruas, {
                    ruas: item.ruas,
                    gol1: 0,
                    gol2: 0,
                    gol3: 0,
                    gol4: 0,
                    gol5: 0,
                    total: 0
                })
            }

            const ruasEntry = ruasMap.get(item.ruas)
            ruasEntry.gol1 += item.gol1
            ruasEntry.gol2 += item.gol2
            ruasEntry.gol3 += item.gol3
            ruasEntry.gol4 += item.gol4
            ruasEntry.gol5 += item.gol5
            ruasEntry.total += item.total
        })

        return Array.from(ruasMap.values())
    }

    // Calculate total pages
    const totalItems = getFilteredSortedData().length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    // Generate array of page numbers for pagination
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i)
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i)
                }
            }
        }

        return pages
    }

    if (isLoading) {
        return (
            <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Memuat data lalu lintas...</span>
            </div>
        )
    }

    // Calculate totals
    const totals = calculateTotals()
    const totalsByRuas = calculateTotalsByRuas()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1) // Reset to first page on search
                        }}
                    />
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="total-tunai">Total Tunai</TabsTrigger>
                    <TabsTrigger value="total-e-toll">Total E-Toll</TabsTrigger>
                    <TabsTrigger value="total-flo">Total Flo</TabsTrigger>
                    <TabsTrigger value="total-ktp">Total KTP</TabsTrigger>
                    <TabsTrigger value="total-keseluruhan">Total Keseluruhan</TabsTrigger>
                    <TabsTrigger value="total-combined">Total E-Toll+Tunai+Flo</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[60px] text-center">No.</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('ruas')}>
                                <div className="flex items-center">
                                    Ruas {sortField === 'ruas' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('gerbang')}>
                                <div className="flex items-center">
                                    Gerbang {sortField === 'gerbang' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('gardu')}>
                                <div className="flex items-center">
                                    Gardu {sortField === 'gardu' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('hari')}>
                                <div className="flex items-center">
                                    Hari {sortField === 'hari' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('tanggal')}>
                                <div className="flex items-center">
                                    Tanggal {sortField === 'tanggal' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Metode Pembayaran</TableHead>
                            <TableHead className="text-center">Gol I</TableHead>
                            <TableHead className="text-center">Gol II</TableHead>
                            <TableHead className="text-center">Gol III</TableHead>
                            <TableHead className="text-center">Gol IV</TableHead>
                            <TableHead className="text-center">Gol V</TableHead>
                            <TableHead className="text-center">Total Lalin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {getCurrentPageData().map((item, index) => (
                            <TableRow key={`${item.ruas}-${item.gerbang}-${index}`}>
                                <TableCell className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                <TableCell>Ruas {item.ruas}</TableCell>
                                <TableCell>Gerbang {item.gerbang}</TableCell>
                                <TableCell>{item.gardu}</TableCell>
                                <TableCell>{item.hari}</TableCell>
                                <TableCell>{item.tanggal}</TableCell>
                                <TableCell>{item.metode}</TableCell>
                                <TableCell className="text-center">{item.gol1}</TableCell>
                                <TableCell className="text-center">{item.gol2}</TableCell>
                                <TableCell className="text-center">{item.gol3}</TableCell>
                                <TableCell className="text-center">{item.gol4}</TableCell>
                                <TableCell className="text-center">{item.gol5}</TableCell>
                                <TableCell className="text-center">{item.total}</TableCell>
                            </TableRow>
                        ))}

                        {/* Subtotals for each Ruas */}
                        {totalsByRuas.map((ruasTotal) => (
                            <TableRow key={`subtotal-ruas-${ruasTotal.ruas}`} className="bg-gray-50">
                                <TableCell colSpan={7} className="font-medium">Total Lalin Ruas {ruasTotal.ruas}</TableCell>
                                <TableCell className="text-center font-medium">{ruasTotal.gol1}</TableCell>
                                <TableCell className="text-center font-medium">{ruasTotal.gol2}</TableCell>
                                <TableCell className="text-center font-medium">{ruasTotal.gol3}</TableCell>
                                <TableCell className="text-center font-medium">{ruasTotal.gol4}</TableCell>
                                <TableCell className="text-center font-medium">{ruasTotal.gol5}</TableCell>
                                <TableCell className="text-center font-medium">{ruasTotal.total}</TableCell>
                            </TableRow>
                        ))}

                        {/* Grand Total */}
                        <TableRow className="bg-slate-200">
                            <TableCell colSpan={7} className="font-bold">Total Lalin Keseluruhan</TableCell>
                            <TableCell className="text-center font-bold">{totals.gol1}</TableCell>
                            <TableCell className="text-center font-bold">{totals.gol2}</TableCell>
                            <TableCell className="text-center font-bold">{totals.gol3}</TableCell>
                            <TableCell className="text-center font-bold">{totals.gol4}</TableCell>
                            <TableCell className="text-center font-bold">{totals.gol5}</TableCell>
                            <TableCell className="text-center font-bold">{totals.total}</TableCell>
                        </TableRow>

                        {getCurrentPageData().length === 0 && (
                            <TableRow>
                                <TableCell colSpan={13} className="text-center py-6 text-muted-foreground">
                                    Tidak ada data yang ditemukan
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm">Show:</span>
                    <Select
                        value={String(itemsPerPage)}
                        onValueChange={(value) => {
                            setItemsPerPage(Number(value))
                            setCurrentPage(1) // Reset to first page when changing items per page
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={String(itemsPerPage)} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm">entries</span>
                </div>

                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>

                    {getPageNumbers().map(page => (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Button>
                </div>
            </div>
        </div>
    )
} 