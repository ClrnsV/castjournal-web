import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { CastDivider } from '../../components/CastDivider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthLayout } from '@/components/auth/AuthLayout';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await forgotPassword(values.email);
    } catch {
      // Deliberately swallowed: the backend always returns success here to
      // avoid revealing which emails are registered, so there's nothing
      // meaningful to show as an error either way.
    } finally {
      setSubmitted(true);
    }
  };

  return (
    <AuthLayout>
      <Card
        className="border-white/40 backdrop-blur-xl"
        style={{ backgroundColor: 'color-mix(in oklab, var(--color-surface) 70%, transparent)' }}
      >
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
        </CardHeader>
        <CardContent>
          <CastDivider />

          {submitted ? (
            <p className="text-sm text-muted-foreground">
              If an account with that email exists, we've sent a link to reset your password.
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Enter your email and we'll send you a link to reset it.
              </p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? 'Sending…' : 'Send reset link'}
                  </Button>
                </form>
              </Form>
            </>
          )}

          <p className="mt-5 text-sm text-muted-foreground">
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}