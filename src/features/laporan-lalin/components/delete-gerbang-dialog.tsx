import { useState } from 'react'
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
import { useDeleteGerbang, GerbangItem } from '@/api/gerbang'
import { toast } from 'sonner'
import { TrashIcon } from 'lucide-react'

interface DeleteGerbangDialogProps {
    gerbang: GerbangItem
}

export function DeleteGerbangDialog({ gerbang }: DeleteGerbangDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const queryClient = useQueryClient()
    const deleteGerbangMutation = useDeleteGerbang()

    const handleDelete = async () => {
        setIsSubmitting(true)

        try {
            await deleteGerbangMutation.mutateAsync({
                id: gerbang.id,
                IdCabang: gerbang.IdCabang
            })

            toast.success('Gerbang berhasil dihapus!')

            // Close dialog
            setOpen(false)

            // Invalidate gerbangs query to refresh the data
            queryClient.invalidateQueries({ queryKey: ['gerbangs'] })
        } catch (error) {
            console.error('Error deleting gerbang:', error)
            toast.error('Gagal menghapus gerbang')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 text-destructive">
                    <TrashIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Hapus Gerbang</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus gerbang ini?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="mb-2">Detail gerbang yang akan dihapus:</p>
                    <ul className="space-y-1 text-sm">
                        <li><span className="font-semibold">ID:</span> {gerbang.id}</li>
                        <li><span className="font-semibold">ID Cabang:</span> {gerbang.IdCabang}</li>
                        <li><span className="font-semibold">Nama Gerbang:</span> {gerbang.NamaGerbang}</li>
                        <li><span className="font-semibold">Nama Cabang:</span> {gerbang.NamaCabang}</li>
                    </ul>
                    <p className="mt-4 text-sm text-destructive">
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isSubmitting}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 