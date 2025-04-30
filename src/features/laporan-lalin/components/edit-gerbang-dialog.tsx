import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateGerbang, GerbangItem } from '@/api/gerbang'
import { toast } from 'sonner'
import { PencilIcon } from 'lucide-react'

interface EditGerbangDialogProps {
    gerbang: GerbangItem
}

export function EditGerbangDialog({ gerbang }: EditGerbangDialogProps) {
    const [open, setOpen] = useState(false)
    const [id, setId] = useState<number>(gerbang.id)
    const [idCabang, setIdCabang] = useState<number>(gerbang.IdCabang)
    const [namaGerbang, setNamaGerbang] = useState(gerbang.NamaGerbang)
    const [namaCabang, setNamaCabang] = useState(gerbang.NamaCabang)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Update local state when gerbang prop changes
    useEffect(() => {
        setId(gerbang.id)
        setIdCabang(gerbang.IdCabang)
        setNamaGerbang(gerbang.NamaGerbang)
        setNamaCabang(gerbang.NamaCabang)
    }, [gerbang])

    const queryClient = useQueryClient()
    const updateGerbangMutation = useUpdateGerbang()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!id || !idCabang || !namaGerbang || !namaCabang) {
            toast.error('Semua field harus diisi!')
            return
        }

        setIsSubmitting(true)

        try {
            await updateGerbangMutation.mutateAsync({
                id,
                IdCabang: idCabang,
                NamaGerbang: namaGerbang,
                NamaCabang: namaCabang
            })

            toast.success('Gerbang berhasil diperbarui!')

            // Close dialog
            setOpen(false)

            // Invalidate gerbangs query to refresh the data
            queryClient.invalidateQueries({ queryKey: ['gerbangs'] })
        } catch (error) {
            console.error('Error updating gerbang:', error)
            toast.error('Gagal memperbarui gerbang')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <PencilIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Gerbang</DialogTitle>
                    <DialogDescription>
                        Perbarui informasi gerbang
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-id" className="text-right">
                                ID
                            </Label>
                            <Input
                                id="edit-id"
                                type="number"
                                min="1"
                                value={id || ''}
                                onChange={(e) => setId(parseInt(e.target.value) || 0)}
                                className="col-span-3"
                                disabled
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-idCabang" className="text-right">
                                ID Cabang
                            </Label>
                            <Input
                                id="edit-idCabang"
                                type="number"
                                min="1"
                                value={idCabang || ''}
                                onChange={(e) => setIdCabang(parseInt(e.target.value) || 0)}
                                className="col-span-3"
                                disabled
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-namaGerbang" className="text-right">
                                Nama Gerbang
                            </Label>
                            <Input
                                id="edit-namaGerbang"
                                value={namaGerbang}
                                onChange={(e) => setNamaGerbang(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-namaCabang" className="text-right">
                                Nama Cabang
                            </Label>
                            <Input
                                id="edit-namaCabang"
                                value={namaCabang}
                                onChange={(e) => setNamaCabang(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 