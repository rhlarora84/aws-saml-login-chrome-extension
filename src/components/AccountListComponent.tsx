import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCopy, faHome, faRightToBracket, faStar} from '@fortawesome/free-solid-svg-icons';


function AccountsComponent({accounts, searchTerm, samlResponse}) {
    const [favoriteAccounts, setFavoriteAccounts] = useState([]);

    // Check if an account is marked as favorite
    const isFavorite = (accountId) => favoriteAccounts.includes(accountId);

    // Load the favorite accounts from Chrome storage
    useEffect(() => {
        chrome.storage.sync.get('favoriteAccounts', (data) => {
            if (data.favoriteAccounts) {
                setFavoriteAccounts(data.favoriteAccounts);
            }
        });
    }, []);

    // Save the favorite accounts to Chrome storage
    useEffect(() => {
        chrome.storage.sync.set({favoriteAccounts});
    }, [favoriteAccounts]);

    // Toggle the favorite status of an account
    const toggleFavorite = (accountId) => {
        if (favoriteAccounts.includes(accountId)) {
            setFavoriteAccounts(favoriteAccounts.filter((id) => id !== accountId));
        } else {
            setFavoriteAccounts([...favoriteAccounts, accountId]);
        }
    };

    const filteredAccounts = accounts.filter(
        (account) =>
            account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountId.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        if (isFavorite(b.accountId) !== isFavorite(a.accountId)) {
            return isFavorite(b.accountId) ? 1 : -1;
        }
        return a.accountName.localeCompare(b.accountName);
    });

    // Copy account ID to clipboard
    const copyToClipboard = (accountId) => {
        navigator.clipboard.writeText(accountId);
    };

    const MAX_ROLE_NAME_LENGTH = 20; // Maximum length of displayed role name before truncation

    const truncateRoleName = (roleName) => {
        if (roleName.length <= MAX_ROLE_NAME_LENGTH) {
            return roleName;
        } else {
            return roleName.slice(0, MAX_ROLE_NAME_LENGTH) + '...';
        }
    };

    const signIn = (roleArn) => {
        const form = document.getElementById('saml_form') as HTMLFormElement;
        const roleInput = document.getElementById('roleIndex') as HTMLInputElement;
        roleInput.value = roleArn;
        form.submit();
    };

    return (
        <form
            id='saml_form'
            name='saml_form'
            method='post'
            action={'/saml'}
        >
            <input type='hidden' name='RelayState' value=''/>
            <input type='hidden' name='SAMLResponse' value={samlResponse}/>
            <input type='hidden' name='name' value=''/>
            <input type='hidden' name='portal' value=''/>
            <input type='hidden' id='roleIndex' name='roleIndex' value=''/>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredAccounts.map((account) => (
                    <div
                        key={account.accountId}
                        className='bg-white rounded-lg shadow shadow-xl'
                    >
                        <div className='p-6 flex flex-col justify-between'>
                            <div>
                                <h2 className='mb-4 text-base font-bold max-w-xs text-cyan-900'>
                                    <FontAwesomeIcon
                                        icon={isFavorite(account.accountId) ? faStar : faHome}
                                        className="text-orange-500 mr-2 cursor-pointer"
                                        title={isFavorite(account.accountId) ? 'Remove from favorites' : 'Add to favorites'}
                                        onClick={() => toggleFavorite(account.accountId)}
                                    />
                                    {account.accountName}
                                </h2>
                                <hr className='my-2'/>
                                <p className='text-sm text-cyan-700'>
                                    <span className='bg-cyan-200 px-2 py-1'>
                                      {account.accountId}
                                        <FontAwesomeIcon
                                            icon={faCopy}
                                            className='text-gray-400 ml-2 hover:text-gray-700 cursor-pointer'
                                            onClick={() => copyToClipboard(account.accountId)}
                                        />
                                    </span>
                                </p>
                                <hr className='my-2'/>
                            </div>
                            <div className='mt-4'>
                                {account.roles.map((role) => (
                                    <div key={role.roleArn} className='mb-2 flex items-center justify-between'>
                                        <span className='saml-role-description text-sm text-cyan-800'
                                              title={role.roleName}>
                                            {truncateRoleName(role.roleName)}
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faRightToBracket}
                                            className='text-orange-500 hover:text-orange-700 cursor-pointer ml-2'
                                            title='Sign in'
                                            onClick={() => signIn(role.roleArn)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </form>
    );
}

export default AccountsComponent;
