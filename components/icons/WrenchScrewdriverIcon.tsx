import React from 'react';
import { IconProps } from './Icon';

export const WrenchScrewdriverIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0 0 21 17.25l-5.878-5.878m-5.878 5.878L11.42 15.17m0 0L21 5.25 18.75 3 11.42 10.33m0 4.84L21 5.25M11.42 15.17 3 21.25V19.5l6-6m-6 6L21 3" />
  </svg>
);