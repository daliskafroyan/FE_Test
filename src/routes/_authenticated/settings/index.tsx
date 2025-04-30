import { createFileRoute } from '@tanstack/react-router'
import LaporanPerHari from '@/features/laporan-lalin/laporan-per-hari'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: LaporanPerHari,
})
