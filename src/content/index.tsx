import React from 'react';
import '../assets/tailwind.css'
import {Account, Role} from "./types";
import App from "./App";
import {createRoot} from "react-dom/client";


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

const form = document.getElementById('saml_form');
let samlResponse = '';
[...form.children].map(childElement => {
    const element = childElement as Element
    if (childElement.tagName == 'INPUT' && childElement.getAttribute('name') == 'SAMLResponse') {
        samlResponse = element.getAttribute('value');
    }
})

// Add our React component to the Form
const root = document.createElement('div');
document.body.innerHTML = ''
document.body.appendChild(root);
createRoot(root).render(<App accounts={accounts} samlResponse={samlResponse}/>)
