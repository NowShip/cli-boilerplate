"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { useGetUser } from "@/hooks/useGetUser";
import { useSignInWithGoogle } from "@/hooks/useAuth";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(4),
});

export default function SignupPage() {
  const { data: user } = useGetUser();
  const signInWithGoogleMutation = useSignInWithGoogle();

  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    });

    if (error) {
      toast.error(error.message);
    } else {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/");
    }
  }

  if (user) {
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-muted-foreground text-center text-sm">Or</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => signInWithGoogleMutation.mutate()}
            disabled={signInWithGoogleMutation.isPending}
          >
            Sign up with Google
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Sign up
          </Button>
          <Link href="/login">Already have an account? Login</Link>
        </form>
      </Form>
    </div>
  );
}
