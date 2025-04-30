import { RuasGerbangTable } from '@/features/laporan-lalin/components/ruas-gerbang-table'
import { Separator } from '@/components/ui/separator'

export default function MasterGerbang() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight">Master Gerbang</h3>
                <p className="text-muted-foreground">
                    Kelola data master gerbang dan ruas jalan
                </p>
            </div>
            <Separator className="my-4" />
            <RuasGerbangTable />
        </div>
    )
} 