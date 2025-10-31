import React from 'react';
import { IconProps } from './Icon';

export const GlobeAltIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 1-9-9c0-4.638 3.007-8.573 7.178-9.963a1.012 1.012 0 0 1 1.644 0C17.993 3.427 21 7.362 21 12a9 9 0 0 1-9 9Zm0 0a8.966 8.966 0 0 0 6.223-2.652M12 21a8.966 8.966 0 0 1-6.223-2.652M12 3a9 9 0 0 1 6.223 2.652M12 3a9 9 0 0 0-6.223 2.652M2.652 9.223A9.01 9.01 0 0 1 3 9m18 0a9.01 9.01 0 0 0-.348.223M9 3.75a8.966 8.966 0 0 1 6 0M15 20.25a8.966 8.966 0 0 1-6 0M21.75 12a9.75 9.75 0 0 1-19.5 0" />
  </svg>
);
