import React, {useEffect, useState, useRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCopy, faHome, faRightToBracket, faStar, faClock, faCheck, faPen, faTimes, faTag, faChartBar} from '@fortawesome/free-solid-svg-icons';
import {AccountListProps, RecentRole, UsageStats} from '../content/types';

function AccountsComponent({accounts, searchTerm, samlResponse, compactView, showStats}: AccountListProps) {
    const [favoriteAccounts, setFavoriteAccounts] = useState([]);
    const [favoritesLoaded, setFavoritesLoaded] = useState(false);
    const [recentRoles, setRecentRoles] = useState<RecentRole[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const accountRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Nicknames feature
    const [nicknames, setNicknames] = useState<{[accountId: string]: string}>({});
    const [editingNickname, setEditingNickname] = useState<string | null>(null);
    const [nicknameInput, setNicknameInput] = useState('');

    // Tags feature
    const [accountTags, setAccountTags] = useState<{[accountId: string]: string[]}>({});
    const [editingTags, setEditingTags] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Usage stats
    const [usageStats, setUsageStats] = useState<UsageStats>({});

    // Highlight matching text in search results
    const highlightMatch = (text: string, term: string) => {
        if (!term) return text;
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i} className="bg-amber-200 dark:bg-amber-500/40 text-inherit px-0.5 rounded">{part}</mark> : part
        );
    };

    // Check if an account is marked as favorite
    const isFavorite = (accountId) => favoriteAccounts.includes(accountId);

    // Load all data from Chrome storage
    useEffect(() => {
        chrome.storage.sync.get(['favoriteAccounts', 'nicknames', 'accountTags'], (data) => {
            if (data.favoriteAccounts) setFavoriteAccounts(data.favoriteAccounts);
            if (data.nicknames) setNicknames(data.nicknames);
            if (data.accountTags) setAccountTags(data.accountTags);
            setFavoritesLoaded(true);
        });
        chrome.storage.local.get(['recentRoles', 'usageStats'], (data) => {
            if (data.recentRoles) setRecentRoles(data.recentRoles);
            if (data.usageStats) setUsageStats(data.usageStats);
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

    // Nickname functions
    const getDisplayName = (accountId: string, originalName: string) => {
        return nicknames[accountId] || originalName;
    };

    const startEditingNickname = (accountId: string, currentName: string) => {
        setEditingNickname(accountId);
        setNicknameInput(nicknames[accountId] || '');
    };

    const saveNickname = (accountId: string) => {
        const newNicknames = {...nicknames};
        if (nicknameInput.trim()) {
            newNicknames[accountId] = nicknameInput.trim();
        } else {
            delete newNicknames[accountId];
        }
        setNicknames(newNicknames);
        chrome.storage.sync.set({nicknames: newNicknames});
        setEditingNickname(null);
        setNicknameInput('');
    };

    // Tag functions
    const getAllTags = () => {
        const tags = new Set<string>();
        Object.values(accountTags).forEach(tagList => tagList.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    };

    const addTag = (accountId: string) => {
        if (!tagInput.trim()) return;
        const newTags = {...accountTags};
        const currentTags = newTags[accountId] || [];
        if (!currentTags.includes(tagInput.trim())) {
            newTags[accountId] = [...currentTags, tagInput.trim()];
            setAccountTags(newTags);
            chrome.storage.sync.set({accountTags: newTags});
        }
        setTagInput('');
    };

    const removeTag = (accountId: string, tag: string) => {
        const newTags = {...accountTags};
        newTags[accountId] = (newTags[accountId] || []).filter(t => t !== tag);
        if (newTags[accountId].length === 0) delete newTags[accountId];
        setAccountTags(newTags);
        chrome.storage.sync.set({accountTags: newTags});
    };

    // Get top used roles for stats
    const getTopUsedRoles = () => {
        return Object.entries(usageStats)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 5);
    };

    // Filter accounts - includes role name search, nickname search, and tag filter
    const filteredAccounts = accounts.filter((account) => {
        const displayName = getDisplayName(account.accountId, account.accountName);
        const matchesSearch = !searchTerm ||
            displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.roles.some(role => role.roleName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTag = !selectedTag || (accountTags[account.accountId] || []).includes(selectedTag);
        return matchesSearch && matchesTag;
    }).sort((a, b) => {
        if (isFavorite(b.accountId) !== isFavorite(a.accountId)) {
            return isFavorite(b.accountId) ? 1 : -1;
        }
        return getDisplayName(a.accountId, a.accountName).localeCompare(getDisplayName(b.accountId, b.accountName));
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

    // Track recent role, usage stats, and sign in
    const signIn = (roleArn: string, accountId: string, accountName: string, roleName: string) => {
        // Save to recent roles
        const displayName = getDisplayName(accountId, accountName);
        const newRecent: RecentRole = {
            accountId,
            accountName: displayName,
            roleArn,
            roleName,
            timestamp: Date.now()
        };
        const updatedRecent = [newRecent, ...recentRoles.filter(r => r.roleArn !== roleArn)].slice(0, 5);
        chrome.storage.local.set({recentRoles: updatedRecent});

        // Update usage stats
        const newStats = {...usageStats};
        if (newStats[roleArn]) {
            newStats[roleArn].count++;
            newStats[roleArn].lastUsed = Date.now();
        } else {
            newStats[roleArn] = {
                count: 1,
                accountName: displayName,
                roleName,
                lastUsed: Date.now()
            };
        }
        chrome.storage.local.set({usageStats: newStats});

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

            {/* Main Content Area */}
            <div>
                    {/* Tag Filter */}
                    {getAllTags().length > 0 && (
                        <div className='mb-4 flex flex-wrap items-center gap-2'>
                            <FontAwesomeIcon icon={faTag} className='text-indigo-500 dark:text-indigo-400'/>
                            <select
                                value={selectedTag || ''}
                                onChange={(e) => setSelectedTag(e.target.value || null)}
                                className='text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            >
                                <option value=''>All tags</option>
                                {getAllTags().map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Usage Stats Panel */}
                    {showStats && (
                        <div className='mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4'>
                            <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center'>
                                <FontAwesomeIcon icon={faChartBar} className='mr-2 text-indigo-500 dark:text-indigo-400'/>
                                Most Used Roles
                            </h3>
                            <div className='space-y-2'>
                                {getTopUsedRoles().map(([roleArn, stats]) => (
                                    <div key={roleArn} className='flex items-center justify-between text-sm'>
                                        <span className='text-slate-700 dark:text-slate-300'>
                                            {stats.accountName} / {stats.roleName}
                                        </span>
                                        <span className='bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium'>
                                            {stats.count} sign-ins
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Roles Section */}
                    {recentRoles.length > 0 && !searchTerm && !selectedTag && (
                        <div className='mb-6'>
                            <h3 className='text-lg font-semibold text-cyan-900 dark:text-cyan-100 mb-3 flex items-center'>
                                <FontAwesomeIcon icon={faClock} className='mr-2 text-cyan-600 dark:text-cyan-400'/>
                                Recently Used
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                {recentRoles.slice(0, 5).map((recent) => (
                                    <div
                                        key={recent.roleArn}
                                        className='bg-cyan-50 hover:bg-cyan-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-cyan-200 dark:border-gray-600 rounded-lg px-3 py-2 cursor-pointer flex items-center gap-2 transition-colors'
                                        onClick={() => signInRecent(recent)}
                                        title={`${recent.accountName} - ${recent.roleName}`}
                                    >
                                        <span className='text-sm text-cyan-800 dark:text-cyan-200 font-medium'>{recent.accountName}</span>
                                        <span className='text-xs text-cyan-600 dark:text-cyan-400'>/ {truncateRoleName(recent.roleName)}</span>
                                        <FontAwesomeIcon
                                            icon={faRightToBracket}
                                            className='text-cyan-600 dark:text-cyan-400 ml-1'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {compactView ? (
                /* Compact List View */
                <div className='space-y-2'>
                    {filteredAccounts.map((account, index) => (
                        <div
                            key={account.accountId}
                            ref={el => accountRefs.current[index] = el}
                            className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 transition-all hover:shadow-md ${selectedIndex === index ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
                        >
                            <div className='flex items-center justify-between flex-wrap gap-2'>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <FontAwesomeIcon
                                        icon={isFavorite(account.accountId) ? faStar : faHome}
                                        className={`cursor-pointer transition-colors ${isFavorite(account.accountId) ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-amber-500'}`}
                                        title={isFavorite(account.accountId) ? 'Remove from favorites' : 'Add to favorites'}
                                        onClick={() => toggleFavorite(account.accountId)}
                                    />
                                    <span className='font-semibold text-slate-800 dark:text-slate-100' title={nicknames[account.accountId] ? `Original: ${account.accountName}` : ''}>
                                        {highlightMatch(getDisplayName(account.accountId, account.accountName), searchTerm)}
                                    </span>
                                    <span className='text-xs bg-cyan-100 dark:bg-gray-700 text-cyan-800 dark:text-cyan-200 px-2 py-0.5 rounded'>
                                        {highlightMatch(account.accountId, searchTerm)}
                                        <FontAwesomeIcon
                                            icon={copiedId === account.accountId ? faCheck : faCopy}
                                            className={`ml-1 cursor-pointer ${copiedId === account.accountId ? 'text-green-500' : 'text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400'}`}
                                            onClick={() => copyToClipboard(account.accountId)}
                                        />
                                    </span>
                                    {/* Tags in compact view */}
                                    {(accountTags[account.accountId] || []).map(tag => (
                                        <span key={tag} className='text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full'>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    {account.roles.map((role) => (
                                        <button
                                            key={role.roleArn}
                                            className='text-xs bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                                            onClick={() => signIn(role.roleArn, account.accountId, account.accountName, role.roleName)}
                                            title={role.roleName}
                                        >
                                            {highlightMatch(truncateRoleName(role.roleName), searchTerm)}
                                            <FontAwesomeIcon icon={faRightToBracket} className='text-cyan-600 dark:text-cyan-400'/>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Grid Card View */
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filteredAccounts.map((account, index) => (
                        <div
                            key={account.accountId}
                            ref={el => accountRefs.current[index] = el}
                            className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg ${selectedIndex === index ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
                        >
                            <div className='p-5 flex flex-col'>
                                {/* Header with name and edit */}
                                <div className='flex items-start justify-between gap-2 mb-3'>
                                    <div className='flex items-start gap-2 min-w-0 flex-1'>
                                        <FontAwesomeIcon
                                            icon={isFavorite(account.accountId) ? faStar : faHome}
                                            className={`cursor-pointer flex-shrink-0 mt-1 transition-colors ${isFavorite(account.accountId) ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-amber-500'}`}
                                            title={isFavorite(account.accountId) ? 'Remove from favorites' : 'Add to favorites'}
                                            onClick={() => toggleFavorite(account.accountId)}
                                        />
                                        {editingNickname === account.accountId ? (
                                            <input
                                                type='text'
                                                value={nicknameInput}
                                                onChange={(e) => setNicknameInput(e.target.value)}
                                                onBlur={() => saveNickname(account.accountId)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveNickname(account.accountId)}
                                                className='flex-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-sm min-w-0 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500'
                                                placeholder={account.accountName}
                                                autoFocus
                                            />
                                        ) : (
                                            <h2 className='text-base font-bold text-slate-800 dark:text-slate-100 break-words'
                                                title={nicknames[account.accountId] ? `Original: ${account.accountName}` : ''}>
                                                {highlightMatch(getDisplayName(account.accountId, account.accountName), searchTerm)}
                                            </h2>
                                        )}
                                    </div>
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className='text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer text-xs flex-shrink-0 mt-1 transition-colors'
                                        title='Edit nickname'
                                        onClick={() => startEditingNickname(account.accountId, account.accountName)}
                                    />
                                </div>

                                {/* Account ID */}
                                <p className='text-sm text-cyan-700 dark:text-cyan-300 mb-3'>
                                    <span className='bg-cyan-100 dark:bg-gray-700 px-2 py-1 rounded inline-flex items-center'>
                                        {highlightMatch(account.accountId, searchTerm)}
                                        <FontAwesomeIcon
                                            icon={copiedId === account.accountId ? faCheck : faCopy}
                                            className={`ml-2 cursor-pointer ${copiedId === account.accountId ? 'text-green-500' : 'text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400'}`}
                                            title={copiedId === account.accountId ? 'Copied!' : 'Copy account ID'}
                                            onClick={() => copyToClipboard(account.accountId)}
                                        />
                                    </span>
                                </p>

                                {/* Roles */}
                                <div className='border-t border-slate-200 dark:border-slate-700 pt-3'>
                                    {account.roles.map((role) => (
                                        <div key={role.roleArn} className='mb-2 flex items-center justify-between group'>
                                            <span className='saml-role-description text-sm text-slate-700 dark:text-slate-300'
                                                  title={role.roleName}>
                                                {highlightMatch(truncateRoleName(role.roleName), searchTerm)}
                                            </span>
                                            <FontAwesomeIcon
                                                icon={faRightToBracket}
                                                className='text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 cursor-pointer ml-2'
                                                title='Sign in'
                                                onClick={() => signIn(role.roleArn, account.accountId, account.accountName, role.roleName)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Tags Section - at bottom */}
                                <div className='border-t border-slate-200 dark:border-slate-700 pt-3 mt-2'>
                                    <div className='flex flex-wrap items-center gap-1'>
                                        {(accountTags[account.accountId] || []).map(tag => (
                                            <span key={tag} className='text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1'>
                                                {tag}
                                                <FontAwesomeIcon
                                                    icon={faTimes}
                                                    className='cursor-pointer hover:text-red-500 text-[10px] transition-colors'
                                                    onClick={() => removeTag(account.accountId, tag)}
                                                />
                                            </span>
                                        ))}
                                        {editingTags === account.accountId ? (
                                            <input
                                                type='text'
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onBlur={() => { addTag(account.accountId); setEditingTags(null); }}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { addTag(account.accountId); setEditingTags(null); }}}
                                                className='text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg w-16 border border-slate-300 dark:border-slate-600'
                                                placeholder='tag'
                                                autoFocus
                                            />
                                        ) : (
                                            <button
                                                onClick={() => setEditingTags(account.accountId)}
                                                className='text-xs text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 px-1 transition-colors'
                                                title='Add tag'
                                            >
                                                <FontAwesomeIcon icon={faTag}/>
                                                <span className='ml-0.5'>+</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                    )}
            </div>
        </form>
    );
}

export default AccountsComponent;
