import React from 'react';
import { IconProps } from './Icon';

export const FlaskIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75-4.217 4.217a1.125 1.125 0 0 1-1.59 0L5.318 12.44A1.125 1.125 0 0 1 5.318 10.85l4.217-4.217a1.125 1.125 0 0 1 1.59 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.075 5.925m3.075.75-4.217 4.217a1.125 1.125 0 0 1-1.59 0L5.318 12.44A1.125 1.125 0 0 1 5.318 10.85l4.217-4.217a1.125 1.125 0 0 1 1.59 0Z" />
  </svg>
);