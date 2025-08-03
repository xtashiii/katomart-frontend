'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';

export default function ScrappersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn) {
        router.push('/');
        return;
      }

      const isValid = await verifyAuth();
      if (!isValid) {
        logout();
        router.push('/');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [isLoggedIn, logout, router]);

  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="content-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="content-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>Scrappers</h1>
          <p>Welcome to the Scrappers section! You are now authenticated.</p>
          <button 
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
