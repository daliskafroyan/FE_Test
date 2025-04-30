import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Plus, Search, Eye } from 'lucide-react'
import { useGerbangs, GerbangItem } from '@/api/gerbang'
import { EditGerbangDialog } from "./edit-gerbang-dialog"
import { DeleteGerbangDialog } from "./delete-gerbang-dialog"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddGerbangDialog } from "./add-gerbang-dialog"

export function RuasGerbangTable() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [sortField, setSortField] = useState<'ruas' | 'gerbang' | 'namaGerbang' | 'namaCabang'>('ruas')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const { data: gerbangResponse, isLoading } = useGerbangs()

    // Get unique 'ruas' (cabang) names for display
    const getRuasName = (idCabang: number) => {
        if (!gerbangResponse) return 'Ruas ' + idCabang;

        // Find a gerbang with this cabang ID to get the NamaCabang
        const gerbang = gerbangResponse.data.rows.rows.find(g => g.IdCabang === idCabang);
        if (gerbang) return gerbang.NamaCabang;

        return 'Ruas ' + idCabang;
    };

    // Sort and filter the data
    const getSortedFilteredData = () => {
        if (!gerbangResponse) return [];

        const data = [...gerbangResponse.data.rows.rows];

        // Filter by search term
        const filtered = data.filter(item =>
            item.NamaGerbang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.NamaCabang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toString().includes(searchTerm) ||
            item.IdCabang.toString().includes(searchTerm)
        );

        // Sort the data
        const sorted = filtered.sort((a, b) => {
            if (sortField === 'ruas') {
                const aValue = a.IdCabang;
                const bValue = b.IdCabang;
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            } else if (sortField === 'gerbang') {
                const aValue = a.id;
                const bValue = b.id;
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            } else if (sortField === 'namaGerbang') {
                const aValue = a.NamaGerbang;
                const bValue = b.NamaGerbang;
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            } else { // namaCabang
                const aValue = a.NamaCabang;
                const bValue = b.NamaCabang;
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
        });

        return sorted;
    };

    // Get paginated data
    const getPaginatedData = () => {
        const sortedFilteredData = getSortedFilteredData();
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedFilteredData.slice(startIndex, startIndex + itemsPerPage);
    };

    // Handle sorting
    const handleSort = (field: 'ruas' | 'gerbang' | 'namaGerbang' | 'namaCabang') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Calculate total pages
    const totalItems = gerbangResponse ? getSortedFilteredData().length : 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Generate array of page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
            }
        }

        return pages;
    };

    if (isLoading) {
        return (
            <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                    />
                </div>
                <AddGerbangDialog />
            </div>

            <div className="rounded-md border w-full">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[60px] text-center">No.</TableHead>
                            <TableHead className="cursor-pointer w-[100px]" onClick={() => handleSort('ruas')}>
                                <div className="flex items-center">
                                    Ruas {sortField === 'ruas' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer w-[100px]" onClick={() => handleSort('gerbang')}>
                                <div className="flex items-center">
                                    Gerbang {sortField === 'gerbang' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('namaGerbang')}>
                                <div className="flex items-center">
                                    Nama Gerbang {sortField === 'namaGerbang' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('namaCabang')}>
                                <div className="flex items-center">
                                    Nama Cabang {sortField === 'namaCabang' && (
                                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="text-right w-[140px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {getPaginatedData().map((item, index) => (
                            <TableRow key={`${item.IdCabang}-${item.id}`}>
                                <TableCell className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                <TableCell>{item.IdCabang}</TableCell>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.NamaGerbang}</TableCell>
                                <TableCell>{item.NamaCabang}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <EditGerbangDialog gerbang={item} />
                                        <DeleteGerbangDialog gerbang={item} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {getPaginatedData().length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
                            setItemsPerPage(Number(value));
                            setCurrentPage(1); // Reset to first page when changing items per page
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
    );
} 