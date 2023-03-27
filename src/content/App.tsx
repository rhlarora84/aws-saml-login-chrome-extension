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
            <form id='saml_form'
                  name='saml_form'
                  method='post'
                  action={'/saml'}>
                <input type="hidden" name="RelayState" value=""/>
                <input type="hidden" name="SAMLResponse" value={samlResponse}/>
                <input type="hidden" name="name" value=""/>
                <input type="hidden" name="portal" value=""/>
                <AccountsComponent accounts={accounts} searchTerm={searchTerm}/>
            </form>
        </div>
    );
}

export default App;


