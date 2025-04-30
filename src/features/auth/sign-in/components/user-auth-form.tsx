import { HTMLAttributes } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { toast } from 'sonner'
import { useLogin } from '@/api/auth'
import { saveAuth } from '@/lib/auth'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'Please enter your username' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate()
  const login = useLogin()

  // Get the redirect parameter from URL
  const getRedirectPath = (): string => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    return redirect || '/'
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: 'Super Admin', // Default for demo purposes
      password: 'password12345', // Default for demo purposes
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    login.mutate(data, {
      onSuccess: (response) => {
        // Save auth data to localStorage
        saveAuth(response)

        // Show success toast
        toast.success('Login successful', {
          description: response.message || 'You have been successfully logged in',
        })

        // Redirect to the original destination or dashboard
        const redirectPath = getRedirectPath()
        navigate({ to: redirectPath as any })
      },
      onError: (error) => {
        toast.error('Login failed', {
          description: error instanceof Error ? error.message : 'An unknown error occurred',
        })
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='Super Admin' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className='mt-2' disabled={login.isPending}>
          {login.isPending ? 'Logging in...' : 'Login'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Default credentials: "Super Admin" / "password12345"
        </p>
      </form>
    </Form>
  )
}
