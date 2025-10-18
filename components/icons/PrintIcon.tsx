
import React from 'react';
import { IconProps } from './Icon';

export const PrintIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6 3.129A52.501 52.501 0 0 1 12 3c4.218 0 8.379 1.153 12.28 3.129l-1.28 10.702M12 21a2.25 2.25 0 0 1-2.25-2.25V15a2.25 2.25 0 0 1 2.25-2.25h.008a2.25 2.25 0 0 1 2.25 2.25v3.75a2.25 2.25 0 0 1-2.25 2.25h-.008Zm4.5-8.25h.008v.008h-.008V12.75Zm-9 0h.008v.008H7.5V12.75Z" />
  </svg>
);
