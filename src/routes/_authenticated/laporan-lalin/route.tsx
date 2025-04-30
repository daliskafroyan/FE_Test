import { createFileRoute } from '@tanstack/react-router'
import LaporanLalin from '@/features/laporan-lalin'

export const Route = createFileRoute('/_authenticated/laporan-lalin')({
    component: LaporanLalin,
}) 