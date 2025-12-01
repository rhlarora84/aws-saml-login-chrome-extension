import React, {useState, useEffect} from "react";
import AccountsComponent from "../components/AccountListComponent";
import NavBarComponent from "../components/NavBarComponent";

function App({accounts, samlResponse}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [compactView, setCompactView] = useState(false);

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
    }, []);

    const handleSearch = (term) => {
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

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
                <NavBarComponent
                    searchTerm={searchTerm}
                    onChange={handleSearch}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    compactView={compactView}
                    toggleCompactView={toggleCompactView}
                    totalAccounts={accounts.length}
                />
                <div className="p-4">
                    <AccountsComponent
                        accounts={accounts}
                        searchTerm={searchTerm}
                        samlResponse={samlResponse}
                        compactView={compactView}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;


