import { createFileRoute } from '@tanstack/react-router'
import MasterGerbang from '@/features/master-gerbang'

export const Route = createFileRoute('/_authenticated/master-gerbang')({
    component: MasterGerbang,
}) 