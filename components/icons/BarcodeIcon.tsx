
import React from 'react';
import { IconProps } from './Icon';

export const BarcodeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5v15h16.5v-15H3.75ZM8.25 9v6m3-6v6m3-6v6" />
  </svg>
);