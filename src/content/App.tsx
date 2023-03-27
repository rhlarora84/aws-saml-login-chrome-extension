import React, {useState} from "react";
import AccountsComponent from "../components/AccountListComponent";
import NavBarComponent from "../components/NavBarComponent";

function App({accounts, samlResponse}) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <div>
            <NavBarComponent searchTerm={searchTerm} onChange={handleSearch}/>
            <AccountsComponent accounts={accounts} searchTerm={searchTerm} samlResponse={samlResponse}/>
        </div>
    );
}

export default App;


