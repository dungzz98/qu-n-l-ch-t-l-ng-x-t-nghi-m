import React from 'react';
import { IconProps } from './Icon';

export const WaterIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-4.073-2.96-7.5-6.932-8.813a17.906 17.906 0 0 0-4.136 0C4.46 4.5 1.5 7.927 1.5 12" />
  </svg>
);