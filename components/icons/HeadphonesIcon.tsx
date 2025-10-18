import React from 'react';
import { IconProps } from './Icon';

export const HeadphonesIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25c0-1.036.84-1.875 1.875-1.875h1.25A1.875 1.875 0 0 1 14.001 8.25v2.625a1.875 1.875 0 0 1-1.875 1.875H11.25a1.875 1.875 0 0 1-1.875-1.875V8.25ZM9 12.75h.008v.008H9v-.008Zm3 0h.008v.008H12v-.008Zm3 0h.008v.008H15v-.008Z" />
  </svg>
);
