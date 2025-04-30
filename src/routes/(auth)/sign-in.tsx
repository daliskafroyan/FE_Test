import { createFileRoute, redirect } from '@tanstack/react-router'
import SignIn from '@/features/auth/sign-in'
import { isAuthenticated } from '@/lib/auth'

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: () => {
    // If user is already authenticated, redirect to the home page
    if (isAuthenticated()) {
      throw redirect({
        to: '/',
        search: {},
      })
    }
  },
  component: SignIn,
})
