export interface Role {
    roleName: string;
    roleArn: string;
}

export interface Account {
    accountName: string;
    accountId: string;
    roles: Role[];
}

export interface AppProps {
    accounts: Account[];
    samlResponse: string;
}

export interface NavBarProps {
    searchTerm: string;
    onChange: (term: string) => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
    compactView: boolean;
    toggleCompactView: () => void;
    totalAccounts: number;
    showStats: boolean;
    toggleShowStats: () => void;
    hasUsageStats: boolean;
}

export interface SearchProps {
    searchTerm: string;
    onChange: (term: string) => void;
    darkMode?: boolean;
}

export interface AccountListProps {
    accounts: Account[];
    searchTerm: string;
    samlResponse: string;
    compactView: boolean;
    showStats: boolean;
}

export interface RecentRole {
    accountId: string;
    accountName: string;
    roleArn: string;
    roleName: string;
    timestamp: number;
}

export interface UsageStats {
    [roleArn: string]: {
        count: number;
        accountName: string;
        roleName: string;
        lastUsed: number;
    };
}

export interface RecentRolesSidebarProps {
    recentRoles: RecentRole[];
    onSignIn: (recent: RecentRole) => void;
}
