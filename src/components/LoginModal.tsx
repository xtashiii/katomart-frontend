'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { login as apiLogin, LoginCredentials } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = useTranslations('auth');
  const { login: setAuthUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const tokens = await apiLogin(credentials);
      
      // For development/mock mode, create user data from credentials
      const userData = {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`
      };
      
      setAuthUser(userData);
      onSuccess();
      onClose();
      setCredentials({ username: '', password: '' });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        setError(t('loginError'));
      } else {
        setError(t('networkError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setCredentials({ username: '', password: '' });
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <div className="login-modal-header">
          <h2>{t('loginRequired')}</h2>
          <button 
            onClick={handleClose} 
            className="close-button"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="login-modal-body">
          <p className="login-message">{t('loginMessage')}</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">
                <FontAwesomeIcon icon={faUser} />
                {t('username')}
              </label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                disabled={isLoading}
                placeholder={t('username')}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} />
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                disabled={isLoading}
                placeholder={t('password')}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-buttons">
              <button 
                type="button" 
                onClick={handleClose}
                className="cancel-button"
                disabled={isLoading}
              >
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    {t('login')}...
                  </>
                ) : (
                  t('login')
                )}
              </button>
            </div>
          </form>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="test-credentials">
              <h4>Test Credentials:</h4>
              <p>Username: <code>admin</code>, Password: <code>password123</code></p>
              <p>Username: <code>user</code>, Password: <code>userpass</code></p>
              <p>Username: <code>test</code>, Password: <code>test123</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
