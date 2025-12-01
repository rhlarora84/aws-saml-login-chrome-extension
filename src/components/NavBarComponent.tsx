import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMoon, faSun, faGrip, faList} from '@fortawesome/free-solid-svg-icons';
import SearchComponent from "./SearchComponent";


function Navbar({searchTerm, onChange, darkMode, toggleDarkMode, compactView, toggleCompactView, totalAccounts}) {
    return (
        <nav className="flex items-center justify-between flex-wrap bg-cyan-900 dark:bg-gray-800 px-2 py-2 transition-colors">
            <div className="flex items-center flex-shrink-0 text-white">
                <img src={chrome.runtime.getURL("logo.png")} alt="logo" className="h-8 w-8 mr-2"/>
                <span className="font-semibold text-xl tracking-tight">SAMLify</span>
                <span className="ml-2 bg-cyan-700 dark:bg-gray-600 text-xs px-2 py-1 rounded-full">
                    {totalAccounts} accounts
                </span>
            </div>
            <div className="flex-grow md:w-1/3 lg:w-1/2 px-4">
                <SearchComponent onChange={onChange} searchTerm={searchTerm} darkMode={darkMode}/>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleCompactView}
                    className="p-2 text-white hover:bg-cyan-800 dark:hover:bg-gray-700 rounded transition-colors"
                    title={compactView ? 'Grid view' : 'Compact view'}
                >
                    <FontAwesomeIcon icon={compactView ? faGrip : faList}/>
                </button>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-white hover:bg-cyan-800 dark:hover:bg-gray-700 rounded transition-colors"
                    title={darkMode ? 'Light mode' : 'Dark mode'}
                >
                    <FontAwesomeIcon icon={darkMode ? faSun : faMoon}/>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
