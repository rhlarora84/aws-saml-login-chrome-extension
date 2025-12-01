import React from 'react';
import {SearchProps} from "../content/types";

// SearchComponent component
function SearchComponent({searchTerm, onChange, darkMode}: SearchProps) {

    return (
        <div className='max-w-md mx-auto'>
            <label htmlFor="account-search" className="sr-only">Search accounts or roles</label>
            <div
                className="relative flex items-center w-full h-8 focus-within:shadow-lg bg-cyan-200 dark:bg-gray-700 overflow-hidden rounded transition-colors">
                <div className="grid place-items-center h-full w-12 text-black dark:text-gray-300" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>

                <input
                    id="account-search"
                    type="search"
                    name="search"
                    className="peer h-full w-full bg-transparent pl-4 pr-2 text-sm text-black dark:text-white outline-none focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Search accounts or roles..."
                    value={searchTerm}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus
                    aria-label="Search accounts or roles"
                />
            </div>
        </div>
    );
}

export default SearchComponent;
