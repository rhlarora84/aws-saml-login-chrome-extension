import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHome} from '@fortawesome/free-solid-svg-icons';

function AccountsComponent({accounts, searchTerm, samlResponse}) {
    // Filter the accounts based on the search term
    const filteredAccounts = accounts.filter(
        (account) =>
            account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <form id='saml_form'
                  name='saml_form'
                  method='post'
                  action={'/saml'}>
                <input type="hidden" name="RelayState" value=""/>
                <input type="hidden" name="SAMLResponse" value={samlResponse}/>
                <input type="hidden" name="name" value=""/>
                <input type="hidden" name="portal" value=""/>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAccounts.map((account) => (
                        <div key={account.accountId} className="bg-white rounded-lg shadow shadow-xl">
                            <div className="p-6 flex flex-col justify-between">
                                <div>
                                    <hr className="my-2"/>
                                    <h2 className="mb-4 text-lg font-bold max-w-xs">
                                        <FontAwesomeIcon icon={faHome} className="text-orange-500 mr-2"/>
                                        {account.accountName}
                                    </h2>
                                    <hr className="my-2"/>
                                    <p className="text-sm text-gray-700">
                                        <span className="bg-yellow-200 px-2 py-1 rounded-md">{account.accountId}</span>
                                    </p>
                                    <hr className="my-2"/>
                                </div>
                                <div className="mt-4">
                                    {account.roles.map((role) => (
                                        <div key={role.roleArn} className="mb-2">
                                            <label className="inline-flex items-center">
                                                <input
                                                    id={role.roleArn}
                                                    type="radio"
                                                    className="form-radio saml-radio accent-pink-300 focus:accent-pink-500"
                                                    name="roleIndex"
                                                    value={role.roleArn}
                                                />
                                                <span className="ml-2 saml-role-description">{role.roleName}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </form>
        </>
    );
}

export default AccountsComponent;
