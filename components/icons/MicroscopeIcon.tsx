import React from 'react';
import { IconProps } from './Icon';

export const MicroscopeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 3.75 9 5.25l1.25 1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.75 3.75 15 5.25l-1.25 1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
  </svg>
);
