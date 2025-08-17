'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useRouter } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';

interface AppButtonProps {
  icon?: IconDefinition;
  href?: string;
  children: React.ReactNode;
  requiresAuth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({ 
  icon, 
  href, 
  children, 
  requiresAuth = true,
  onClick,
  disabled,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
      return;
    }
    
    e.preventDefault();
    
    if (!href) return;

    if (!requiresAuth || href.includes('/documentation')) {
      router.push(href);
      return;
    }

    if (isLoggedIn) {
      const isValid = await verifyAuth();
      if (isValid) {
        router.push(href);
        return;
      }
    }

    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <>
      <button 
        onClick={handleClick} 
        className="app-button"
        disabled={disabled}
      >
        {icon && <FontAwesomeIcon icon={icon} />}
        {children}
      </button>
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default AppButton;
