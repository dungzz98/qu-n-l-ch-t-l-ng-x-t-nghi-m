import React from 'react';
import { IconProps } from './Icon';

export const ListCheckIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M12 3.75h.008v.008H12V3.75Zm0 16.5h.008v.008H12v-.008Z" />
    <path d="M10.5 6.75h3M10.5 17.25h3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);