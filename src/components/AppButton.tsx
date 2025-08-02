import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface AppButtonProps {
  icon: IconDefinition;
  href: string;
  children: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({ icon, href, children }) => {
  return (
    <a href={href} className="app-button">
      <FontAwesomeIcon icon={icon} />
      {children}
    </a>
  );
};

export default AppButton;
