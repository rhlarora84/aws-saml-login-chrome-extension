import React from 'react';

// SearchComponent component
function SearchComponent({searchTerm, onChange}) {

    return (
        <div className='max-w-md mx-auto'>
            <div
                className="relative flex items-center w-full h-8 focus-within:shadow-lg bg-cyan-200 overflow-hidden">
                <div className="grid place-items-center h-full w-12 text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>

                <input
                    type="search"
                    name="search"
                    className="peer h-full w-full bg-transparent pl-4 pr-2 text-sm text-black outline-none focus:outline-none"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}

export default SearchComponent;
