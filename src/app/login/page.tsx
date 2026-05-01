'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../components/AuthProvider';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <AuthForm />
      </main>
    </div>
  );
}
