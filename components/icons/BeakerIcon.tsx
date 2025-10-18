
import React from 'react';
import { IconProps } from './Icon';

export const BeakerIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.252-.02.507-.02.762-.02s.51.001.762.02m-1.524 0a4.5 4.5 0 0 0-4.5 4.5v5.714a2.25 2.25 0 0 0 .659 1.591L9.25 21.5h5.5l3.25-3.25a2.25 2.25 0 0 0 .659-1.591V7.604a4.5 4.5 0 0 0-4.5-4.5m-7.5 0h15" />
  </svg>
);
