export interface Role {
    roleName: string;
    roleArn: string;
}

export interface Account {
    accountName: string;
    accountId: string;
    roles: Role[];
}
