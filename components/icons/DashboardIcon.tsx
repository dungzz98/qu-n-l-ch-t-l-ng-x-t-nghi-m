
import React from 'react';
import { IconProps } from './Icon';

export const DashboardIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h8.25v8.25H3v-8.25ZM3 3h8.25v8.25H3V3Zm10.5 0h8.25v8.25h-8.25V3ZM13.5 13.5h8.25v8.25h-8.25v-8.25Z" />
    </svg>
);
