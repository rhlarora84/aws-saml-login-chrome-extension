import React from 'react';
import '../assets/tailwind.css'
import * as ReactDOM from 'react-dom';
import {Account, Role} from "./types";
import AccountFormComponent from "../components/accountFormComponent";


console.log("Reading Accounts")

let accounts: Account[] = []
document.querySelectorAll('.saml-account')
    .forEach(accountBlock => {
        const accountElement = accountBlock.querySelector('.saml-account-name');

        if (accountElement) {
            const accountTxt = accountElement.textContent
            const accountRegEx = new RegExp(/Account:\s(?<accountName>.+)\s\((?<accountId>\d+)\)/gmi)
            const accountDetails = accountRegEx.exec(accountTxt);

            const roles: Role[] = [];
            accountBlock.querySelectorAll('.saml-role')
                .forEach(samlRole => {
                    const role: Role = {
                        roleName: samlRole.querySelector('.saml-role-description').textContent,
                        roleArn: samlRole.querySelector('.saml-radio').id,
                    }
                    roles.push(role)
                })

            const account: Account = {
                accountName: accountDetails[1],
                accountId: accountDetails[2],
                roles
            }
            accounts.push(account)
        }
    });

accounts = accounts.sort((a, b) => (a.accountName < b.accountName) ? -1 : 1)

// Remove elements from existing form except for Input Variables which are required
const form = document.getElementById('saml_form');
[...form.children].map(childElement => {
    const element = childElement as Element
    if (childElement.tagName != 'INPUT') {
        form.removeChild(childElement)
    }
})

// Add our React component to the Form
const root = document.createElement('div');
form.appendChild(root);
ReactDOM.render(<AccountFormComponent accounts={accounts}/>, root);

