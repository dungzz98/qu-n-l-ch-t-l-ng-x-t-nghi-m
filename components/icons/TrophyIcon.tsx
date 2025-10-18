import React from 'react';
import { IconProps } from './Icon';

export const TrophyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.006 9.006 0 0 1-5.783-2.956 9.006 9.006 0 0 1-2.956-5.783V8.625a9.006 9.006 0 0 1 2.956-5.783A9.006 9.006 0 0 1 7.5 0h9a9.006 9.006 0 0 1 5.783 2.842A9.006 9.006 0 0 1 25.2 8.625v1.5a9.006 9.006 0 0 1-2.956 5.783A9.006 9.006 0 0 1 16.5 18.75Zm-9-1.5h9a7.5 7.5 0 0 0 7.5-7.5V8.625a7.5 7.5 0 0 0-7.5-7.5h-9a7.5 7.5 0 0 0-7.5 7.5V10.5a7.5 7.5 0 0 0 7.5 7.5Z" transform="translate(-1.2 -0.375)" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3M12 21V11.25" />
  </svg>
);