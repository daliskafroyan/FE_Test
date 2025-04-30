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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateGerbang } from '@/api/gerbang'
import { toast } from 'sonner'

export function AddGerbangDialog() {
    const [open, setOpen] = useState(false)
    const [id, setId] = useState<number>(0)
    const [idCabang, setIdCabang] = useState<number>(0)
    const [namaGerbang, setNamaGerbang] = useState('')
    const [namaCabang, setNamaCabang] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const queryClient = useQueryClient()
    const createGerbangMutation = useCreateGerbang()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!id || !idCabang || !namaGerbang || !namaCabang) {
            toast.error('Semua field harus diisi!')
            return
        }

        setIsSubmitting(true)

        try {
            await createGerbangMutation.mutateAsync({
                id,
                IdCabang: idCabang,
                NamaGerbang: namaGerbang,
                NamaCabang: namaCabang
            })

            toast.success('Gerbang berhasil ditambahkan!')

            // Reset form
            setId(0)
            setIdCabang(0)
            setNamaGerbang('')
            setNamaCabang('')

            // Close dialog
            setOpen(false)

            // Invalidate gerbangs query to refresh the data
            queryClient.invalidateQueries({ queryKey: ['gerbangs'] })
        } catch (error) {
            console.error('Error creating gerbang:', error)
            toast.error('Gagal menambahkan gerbang')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Tambah Gerbang Baru</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Gerbang Baru</DialogTitle>
                    <DialogDescription>
                        Isi form berikut untuk menambahkan gerbang baru
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="id" className="text-right">
                                ID
                            </Label>
                            <Input
                                id="id"
                                type="number"
                                min="1"
                                value={id || ''}
                                onChange={(e) => setId(parseInt(e.target.value) || 0)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="idCabang" className="text-right">
                                ID Cabang
                            </Label>
                            <Input
                                id="idCabang"
                                type="number"
                                min="1"
                                value={idCabang || ''}
                                onChange={(e) => setIdCabang(parseInt(e.target.value) || 0)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="namaGerbang" className="text-right">
                                Nama Gerbang
                            </Label>
                            <Input
                                id="namaGerbang"
                                value={namaGerbang}
                                onChange={(e) => setNamaGerbang(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="namaCabang" className="text-right">
                                Nama Cabang
                            </Label>
                            <Input
                                id="namaCabang"
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