import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMoon, faSun, faGrip, faList, faChartBar} from '@fortawesome/free-solid-svg-icons';
import SearchComponent from "./SearchComponent";
import {NavBarProps} from "../content/types";


function Navbar({searchTerm, onChange, darkMode, toggleDarkMode, compactView, toggleCompactView, totalAccounts, showStats, toggleShowStats, hasUsageStats}: NavBarProps) {
    return (
        <nav className="flex items-center justify-between flex-wrap bg-cyan-900 dark:from-slate-800 dark:to-slate-900 dark:bg-gradient-to-r px-2 py-2 shadow-lg transition-colors" role="navigation" aria-label="Main navigation">
            <div className="flex items-center flex-shrink-0 text-white">
                <img src={chrome.runtime.getURL("logo.png")} alt="SAMLify logo" className="h-8 w-8 mr-2"/>
                <span className="font-semibold text-xl tracking-tight">SAMLify</span>
                <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full" aria-live="polite">
                    {totalAccounts} accounts
                </span>
            </div>
            <div className="flex-grow md:w-1/3 lg:w-1/2 px-4" role="search">
                <SearchComponent onChange={onChange} searchTerm={searchTerm} darkMode={darkMode}/>
            </div>
            <div className="flex items-center gap-1" role="toolbar" aria-label="View options">
                {hasUsageStats && (
                    <button
                        onClick={toggleShowStats}
                        className={`p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${showStats ? 'bg-white/20 text-white' : ''}`}
                        title={showStats ? 'Hide stats' : 'Show stats'}
                        aria-label={showStats ? 'Hide usage statistics' : 'Show usage statistics'}
                        aria-pressed={showStats}
                    >
                        <FontAwesomeIcon icon={faChartBar}/>
                    </button>
                )}
                <button
                    onClick={toggleCompactView}
                    className={`p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${compactView ? 'bg-white/20 text-white' : ''}`}
                    title={compactView ? 'Grid view' : 'Compact view'}
                    aria-label={compactView ? 'Switch to grid view' : 'Switch to compact view'}
                    aria-pressed={compactView}
                >
                    <FontAwesomeIcon icon={compactView ? faGrip : faList}/>
                </button>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                    title={darkMode ? 'Light mode' : 'Dark mode'}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    aria-pressed={darkMode}
                >
                    <FontAwesomeIcon icon={darkMode ? faSun : faMoon}/>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
