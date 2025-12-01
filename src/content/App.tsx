import React, {useState, useEffect} from "react";
import AccountsComponent from "../components/AccountListComponent";
import NavBarComponent from "../components/NavBarComponent";
import {AppProps, UsageStats} from "./types";

function App({accounts, samlResponse}: AppProps) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [compactView, setCompactView] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(false);
    const [hasUsageStats, setHasUsageStats] = useState<boolean>(false);

    // Load preferences from storage and detect system preference
    useEffect(() => {
        chrome.storage.sync.get(['darkMode', 'compactView'], (data) => {
            if (data.darkMode !== undefined) {
                setDarkMode(data.darkMode);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setDarkMode(true);
            }
            if (data.compactView !== undefined) {
                setCompactView(data.compactView);
            }
        });
        // Check if we have usage stats
        chrome.storage.local.get(['usageStats'], (data) => {
            if (data.usageStats && Object.keys(data.usageStats).length > 0) {
                setHasUsageStats(true);
            }
        });
    }, []);

    const handleSearch = (term: string): void => {
        setSearchTerm(term);
    };

    const toggleDarkMode = () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        chrome.storage.sync.set({darkMode: newValue});
    };

    const toggleCompactView = () => {
        const newValue = !compactView;
        setCompactView(newValue);
        chrome.storage.sync.set({compactView: newValue});
    };

    const toggleShowStats = () => {
        setShowStats(!showStats);
    };

    return (
        <div className={darkMode ? 'dark' : ''} role="application" aria-label="SAMLify AWS Account Selector">
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
                <NavBarComponent
                    searchTerm={searchTerm}
                    onChange={handleSearch}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    compactView={compactView}
                    toggleCompactView={toggleCompactView}
                    totalAccounts={accounts.length}
                    showStats={showStats}
                    toggleShowStats={toggleShowStats}
                    hasUsageStats={hasUsageStats}
                />
                <div className="p-4">
                    <AccountsComponent
                        accounts={accounts}
                        searchTerm={searchTerm}
                        samlResponse={samlResponse}
                        compactView={compactView}
                        showStats={showStats}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;


