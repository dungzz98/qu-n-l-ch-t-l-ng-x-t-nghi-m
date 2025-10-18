import React from 'react';
import { IconProps } from './Icon';

export const FireIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0-1.472-1.218A8.25 8.25 0 0 0 9 2.25c0 1.25.336 2.455.93 3.501a8.25 8.25 0 0 1 5.432-1.537Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 18.75.393.393a.75.75 0 0 0 1.06-1.06l-.393-.393a.75.75 0 0 0-1.06 1.06Zm0 0-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 1.06Z" />
  </svg>
);