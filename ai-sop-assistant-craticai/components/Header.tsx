/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import SearchIcon from './icons/SearchIcon';
import BellIcon from './icons/BellIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

const Header: React.FC = () => {
    return (
        <header className="flex-shrink-0 bg-cratic-panel border-b border-cratic-border h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-cratic-subtle text-cratic-text-secondary">
                    <ChevronLeftIcon />
                </button>
            </div>
            <div className="flex-1 max-w-lg">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="search"
                        name="search"
                        id="search"
                        className="block w-full pl-10 pr-3 py-2 border border-cratic-border rounded-md leading-5 bg-cratic-subtle placeholder-cratic-text-secondary focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-cratic-purple focus:border-cratic-purple sm:text-sm"
                        placeholder="Search reports, audits, documents..."
                    />
                </div>
            </div>
            <div className="flex items-center space-x-4">
                 <div className="relative">
                    <button className="p-2 rounded-full hover:bg-cratic-subtle text-cratic-text-secondary">
                        <BellIcon />
                    </button>
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">3</span>
                </div>
                <button className="p-1 rounded-full hover:bg-cratic-subtle text-cratic-text-secondary">
                    <UserCircleIcon />
                </button>
            </div>
        </header>
    );
};

export default Header;
