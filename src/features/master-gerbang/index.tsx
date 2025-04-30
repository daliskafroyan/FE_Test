import { RuasGerbangTable } from '@/features/laporan-lalin/components/ruas-gerbang-table'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export default function MasterGerbang() {
    return (
        <>
            <Header>
                <div className='ml-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main fixed>
                <div className='space-y-0.5'>
                    <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                        Master Gerbang
                    </h1>
                    <p className='text-muted-foreground'>
                        Kelola data master gerbang dan ruas jalan
                    </p>
                </div>
                <Separator className='my-4 lg:my-6' />
                <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <div className='flex w-full overflow-y-hidden p-1'>
                        <RuasGerbangTable />
                    </div>
                </div>
            </Main>
        </>
    )
} 