import React, {useEffect, useState, useRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCopy, faHome, faRightToBracket, faStar, faClock, faCheck} from '@fortawesome/free-solid-svg-icons';

interface RecentRole {
    accountId: string;
    accountName: string;
    roleArn: string;
    roleName: string;
    timestamp: number;
}

function AccountsComponent({accounts, searchTerm, samlResponse}) {
    const [favoriteAccounts, setFavoriteAccounts] = useState([]);
    const [favoritesLoaded, setFavoritesLoaded] = useState(false);
    const [recentRoles, setRecentRoles] = useState<RecentRole[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const accountRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Check if an account is marked as favorite
    const isFavorite = (accountId) => favoriteAccounts.includes(accountId);

    // Load the favorite accounts and recent roles from Chrome storage
    useEffect(() => {
        chrome.storage.sync.get('favoriteAccounts', (data) => {
            if (data.favoriteAccounts) {
                setFavoriteAccounts(data.favoriteAccounts);
            }
            setFavoritesLoaded(true);
        });
        chrome.storage.local.get('recentRoles', (data) => {
            if (data.recentRoles) {
                setRecentRoles(data.recentRoles);
            }
        });
    }, []);

    // Save the favorite accounts to Chrome storage (only after initial load)
    useEffect(() => {
        if (favoritesLoaded) {
            chrome.storage.sync.set({favoriteAccounts});
        }
    }, [favoriteAccounts, favoritesLoaded]);

    // Toggle the favorite status of an account
    const toggleFavorite = (accountId) => {
        if (favoriteAccounts.includes(accountId)) {
            setFavoriteAccounts(favoriteAccounts.filter((id) => id !== accountId));
        } else {
            setFavoriteAccounts([...favoriteAccounts, accountId]);
        }
    };

    // Filter accounts - now includes role name search
    const filteredAccounts = accounts.filter(
        (account) =>
            account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.roles.some(role => role.roleName.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
        if (isFavorite(b.accountId) !== isFavorite(a.accountId)) {
            return isFavorite(b.accountId) ? 1 : -1;
        }
        return a.accountName.localeCompare(b.accountName);
    });

    // Copy account ID to clipboard with feedback
    const copyToClipboard = (accountId) => {
        navigator.clipboard.writeText(accountId);
        setCopiedId(accountId);
        setTimeout(() => setCopiedId(null), 1500);
    };

    // Keyboard navigation (supports arrow keys for grid layout)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if user is typing in search
            if ((e.target as HTMLElement).tagName === 'INPUT') {
                if (e.key === 'Escape') {
                    (e.target as HTMLInputElement).blur();
                    setSelectedIndex(-1);
                }
                return;
            }

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredAccounts.length - 1));
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, -1));
            } else if (e.key === 'Escape') {
                setSelectedIndex(-1);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [filteredAccounts.length]);

    // Scroll selected account into view
    useEffect(() => {
        if (selectedIndex >= 0 && accountRefs.current[selectedIndex]) {
            accountRefs.current[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedIndex]);

    const MAX_ROLE_NAME_LENGTH = 20; // Maximum length of displayed role name before truncation

    const truncateRoleName = (roleName) => {
        if (roleName.length <= MAX_ROLE_NAME_LENGTH) {
            return roleName;
        } else {
            return roleName.slice(0, MAX_ROLE_NAME_LENGTH) + '...';
        }
    };

    // Track recent role and sign in
    const signIn = (roleArn: string, accountId: string, accountName: string, roleName: string) => {
        // Save to recent roles
        const newRecent: RecentRole = {
            accountId,
            accountName,
            roleArn,
            roleName,
            timestamp: Date.now()
        };
        const updatedRecent = [newRecent, ...recentRoles.filter(r => r.roleArn !== roleArn)].slice(0, 5);
        chrome.storage.local.set({recentRoles: updatedRecent});

        const form = document.getElementById('saml_form') as HTMLFormElement;
        const roleInput = document.getElementById('roleIndex') as HTMLInputElement;
        roleInput.value = roleArn;
        form.submit();
    };

    // Sign in from recent
    const signInRecent = (recent: RecentRole) => {
        signIn(recent.roleArn, recent.accountId, recent.accountName, recent.roleName);
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

            {/* Recent Roles Section */}
            {recentRoles.length > 0 && !searchTerm && (
                <div className='mb-6'>
                    <h3 className='text-lg font-semibold text-cyan-900 mb-3 flex items-center'>
                        <FontAwesomeIcon icon={faClock} className='mr-2 text-orange-500'/>
                        Recently Used
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                        {recentRoles.map((recent) => (
                            <div
                                key={recent.roleArn}
                                className='bg-cyan-100 hover:bg-cyan-200 rounded-lg px-3 py-2 cursor-pointer flex items-center gap-2 transition-colors'
                                onClick={() => signInRecent(recent)}
                                title={`${recent.accountName} - ${recent.roleName}`}
                            >
                                <span className='text-sm text-cyan-800 font-medium'>{recent.accountName}</span>
                                <span className='text-xs text-cyan-600'>/ {truncateRoleName(recent.roleName)}</span>
                                <FontAwesomeIcon
                                    icon={faRightToBracket}
                                    className='text-orange-500 ml-1'
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredAccounts.map((account, index) => (
                    <div
                        key={account.accountId}
                        ref={el => accountRefs.current[index] = el}
                        className={`bg-white rounded-lg shadow shadow-xl transition-all ${selectedIndex === index ? 'ring-2 ring-orange-500' : ''}`}
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
                                            icon={copiedId === account.accountId ? faCheck : faCopy}
                                            className={`ml-2 cursor-pointer ${copiedId === account.accountId ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'}`}
                                            title={copiedId === account.accountId ? 'Copied!' : 'Copy account ID'}
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
                                            onClick={() => signIn(role.roleArn, account.accountId, account.accountName, role.roleName)}
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
