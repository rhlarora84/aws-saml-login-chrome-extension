import React from 'react';

function AccountsComponent({accounts, searchTerm}) {
    // Filter the accounts based on the search term
    const filteredAccounts = accounts.filter(
        (account) =>
            account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-wrap justify-start -mx-4">
            {filteredAccounts.map((account) => (
                <div key={account.accountId} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 px-4 mb-8">
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h2 className="mb-4 text-lg font-bold">{account.accountName}</h2>
                        <p className="text-sm text-gray-700">Account ID: {account.accountId}</p>
                        <div className="mt-4">
                            {account.roles.map((role) => (
                                <div key={role.roleArn} className="mb-2">
                                    <label className="inline-flex items-center">
                                        <input id={role.roleArn} type="radio" className="form-radio saml-radio"
                                               name="roleIndex" value={role.roleArn}/>
                                        <span className="ml-2 saml-role-description">{role.roleName}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AccountsComponent;