import React, {useState} from "react";
import SearchComponent from "../components/SearchComponent";
import AccountsComponent from "../components/AccountListComponent";

function App({accounts}) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <>
            <SearchComponent searchTerm={searchTerm} onChange={handleSearch}/>
            <AccountsComponent accounts={accounts} searchTerm={searchTerm}/>
            <div className="mt-8">
                <a id="signin_button" rel="noopener noreferrer" href="#">
                    <button
                        className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                        Sign In
                    </button>
                </a>
            </div>
        </>
    );
}

export default App;


