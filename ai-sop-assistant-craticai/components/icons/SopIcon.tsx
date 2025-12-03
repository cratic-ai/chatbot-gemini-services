/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const SopIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cratic-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Clipboard */}
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        {/* Gear */}
        <circle cx="12" cy="14" r="2"></circle>
        <path d="M12 11.535V10"></path>
        <path d="M12 18v-1.535"></path>
        <path d="m14.828 15.172 1.061 1.06"></path>
        <path d="m8.111 9.228 1.06-1.06"></path>
        <path d="m16.243 12 1.535 0"></path>
        <path d="m6.223 12 1.535 0"></path>
        <path d="m14.828 8.828 1.061-1.06"></path>
        <path d="m8.111 14.772 1.06 1.06"></path>
    </svg>
);

export default SopIcon;