import React from 'react';
import SearchComponent from "./SearchComponent";


function Navbar({searchTerm, onChange}) {

    function submitForm() {
        console.log("Submitting form")
        document.forms[0].submit()
    }

    return (
        <nav className="flex items-center justify-between flex-wrap bg-cyan-900 px-2 py-2">
            <div className="flex items-center flex-shrink-0 text-white">
                <img src={chrome.runtime.getURL("logo.png")} alt="logo" className="h-8 w-8 mr-2"/>
                <span className="font-semibold text-xl tracking-tight">SAMLify</span>
            </div>
            <div className="flex-grow md:w-1/3 lg:w-1/2 px-4">
                <SearchComponent onChange={onChange} searchTerm={searchTerm}/>
            </div>
            <div className="flex items-center flex-shrink-0">
                <button onClick={submitForm}
                        className="text-cyan-900 focus:shadow-outline bg-white px-3 py-2"
                        type="button">
                    Sign In
                </button>
            </div>
        </nav>

    );
}

export default Navbar;
