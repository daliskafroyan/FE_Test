import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useGerbangs, GerbangItem } from "@/api/gerbang"
import { EditGerbangDialog } from "./edit-gerbang-dialog"
import { DeleteGerbangDialog } from "./delete-gerbang-dialog"
import { Loader2 } from "lucide-react"

export function GerbangList() {
    const { data: gerbangResponse, isLoading: isLoadingGerbangs } = useGerbangs()

    if (isLoadingGerbangs) {
        return (
            <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Memuat data gerbang...</span>
            </div>
        )
    }

    if (!gerbangResponse || !gerbangResponse.data.rows.rows.length) {
        return (
            <div className="text-center py-4">
                <p>Tidak ada data gerbang tersedia.</p>
            </div>
        )
    }

    const gerbangs = gerbangResponse.data.rows.rows

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daftar Gerbang</CardTitle>
                <CardDescription>
                    Menampilkan semua gerbang yang tersedia
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>ID Cabang</TableHead>
                            <TableHead>Nama Gerbang</TableHead>
                            <TableHead>Nama Cabang</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gerbangs.map((gerbang: GerbangItem) => (
                            <TableRow key={`${gerbang.IdCabang}-${gerbang.id}`}>
                                <TableCell>{gerbang.id}</TableCell>
                                <TableCell>{gerbang.IdCabang}</TableCell>
                                <TableCell>{gerbang.NamaGerbang}</TableCell>
                                <TableCell>{gerbang.NamaCabang}</TableCell>
                                <TableCell className="flex justify-end space-x-2">
                                    <EditGerbangDialog gerbang={gerbang} />
                                    <DeleteGerbangDialog gerbang={gerbang} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
} 