import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/500')({
    component: Error500Page,
})

function Error500Page() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">500 - Internal Server Error</h1>
            <p className="mt-4 text-lg">Something went wrong on our end. Please try again later.</p>
        </div>
    )
} 