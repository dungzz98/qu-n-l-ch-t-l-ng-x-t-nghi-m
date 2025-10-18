
import React from 'react';
import { IconProps } from './Icon';

export const ThermometerIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25v2.25m-2.25-2.25v2.25m4.5-2.25v2.25M6.75 21v-2.25a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25v2.25m-10.5-2.25a2.25 2.25 0 0 0-2.25-2.25H3.75a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h.75a2.25 2.25 0 0 0 2.25-2.25Zm10.5 0a2.25 2.25 0 0 0 2.25-2.25h.75a.75.75 0 0 1 .75.75v1.5c0 .414-.336.75-.75.75h-.75a2.25 2.25 0 0 0-2.25-2.25ZM9 3.75a3 3 0 0 1 6 0v3a3 3 0 0 1-6 0v-3Z" />
  </svg>
);
