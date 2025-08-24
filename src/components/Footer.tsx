'use client';

import React from 'react';
import { FaGithub, FaTelegram, FaLinkedin } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer
      style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '1rem',
        borderTop: '3px solid var(--primary-dark)',
        fontSize: '0.95rem',
        textAlign: 'center',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.07)',
      }}
    >
      <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
        {t.rich('developedBy', {
          author: (chunks) => <span style={{ color: '#fff' }}>{chunks}</span>,
        })}
      </div>
      <div
        style={{
          marginBottom: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.2rem',
        }}
      >
        <a
          href="https://github.com/katomaro/katomart"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white', fontSize: '1.3em' }}
          aria-label="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://t.me/GatosDodois"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white', fontSize: '1.3em' }}
          aria-label="Telegram"
        >
          <FaTelegram />
        </a>
        <a
          href="https://www.linkedin.com/in/victor-hugo-carvalho-dos-reis-santos-1a41a936a"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white', fontSize: '1.3em' }}
          aria-label="LinkedIn (Author)"
        >
          <FaLinkedin />
        </a>
      </div>
      <div
        style={{ fontSize: '0.75em', color: '#cccccc', marginTop: '0.3rem' }}
      >
        {t('disclaimer')}
      </div>
      <div style={{ fontSize: '0.8em', color: '#e0e0e0', marginTop: '0.5rem' }}>
        {t('copyright')}
      </div>
    </footer>
  );
}
