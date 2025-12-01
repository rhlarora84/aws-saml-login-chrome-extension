import React from 'react';
import '../assets/tailwind.css'
import {Account, Role} from "./types";
import App from "./App";
import {createRoot} from "react-dom/client";

// Error component for graceful degradation
function ErrorFallback({error, originalContent}: {error: string, originalContent: string}) {
    const restoreOriginal = () => {
        document.body.innerHTML = originalContent;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-red-600 mb-4">SAMLify Error</h1>
                <p className="text-gray-700 mb-4">
                    SAMLify encountered an error while parsing the AWS SAML page.
                    This might happen if AWS changed their page structure.
                </p>
                <p className="text-sm text-gray-500 mb-4 font-mono bg-gray-100 p-2 rounded">
                    {error}
                </p>
                <button
                    onClick={restoreOriginal}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition-colors"
                >
                    Use Original AWS Page
                </button>
            </div>
        </div>
    );
}

// Store original page content for fallback
const originalContent = document.body.innerHTML;

try {
    console.log("SAMLify: Parsing accounts...");

    let accounts: Account[] = [];
    let parseErrors: string[] = [];

    document.querySelectorAll('.saml-account')
        .forEach(accountBlock => {
            try {
                const accountElement = accountBlock.querySelector('.saml-account-name');

                if (accountElement) {
                    const accountTxt = accountElement.textContent || '';
                    const accountRegEx = new RegExp(/Account:\s(?<accountName>.+)\s\((?<accountId>\d+)\)/gmi);
                    const accountDetails = accountRegEx.exec(accountTxt);

                    if (!accountDetails || !accountDetails[1] || !accountDetails[2]) {
                        parseErrors.push(`Could not parse account: ${accountTxt}`);
                        return;
                    }

                    const roles: Role[] = [];
                    accountBlock.querySelectorAll('.saml-role')
                        .forEach(samlRole => {
                            try {
                                const roleDescEl = samlRole.querySelector('.saml-role-description');
                                const roleRadioEl = samlRole.querySelector('.saml-radio');

                                if (roleDescEl && roleRadioEl) {
                                    const role: Role = {
                                        roleName: roleDescEl.textContent || 'Unknown Role',
                                        roleArn: roleRadioEl.id || '',
                                    };
                                    if (role.roleArn) {
                                        roles.push(role);
                                    }
                                }
                            } catch (roleError) {
                                parseErrors.push(`Error parsing role: ${roleError}`);
                            }
                        });

                    if (roles.length > 0) {
                        const account: Account = {
                            accountName: accountDetails[1],
                            accountId: accountDetails[2],
                            roles
                        };
                        accounts.push(account);
                    }
                }
            } catch (accountError) {
                parseErrors.push(`Error parsing account block: ${accountError}`);
            }
        });

    // Check if we found any accounts
    if (accounts.length === 0) {
        throw new Error('No accounts found on page. The page structure may have changed.');
    }

    // Log any non-fatal parse errors
    if (parseErrors.length > 0) {
        console.warn('SAMLify: Some parsing warnings:', parseErrors);
    }

    // Get SAML response
    const form = document.getElementById('saml_form');
    if (!form) {
        throw new Error('SAML form not found on page.');
    }

    let samlResponse = '';
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.getAttribute('name') === 'SAMLResponse') {
            samlResponse = input.getAttribute('value') || '';
        }
    });

    if (!samlResponse) {
        throw new Error('SAML response not found in form.');
    }

    console.log(`SAMLify: Successfully parsed ${accounts.length} accounts`);

    // Add our React component to the page
    const root = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(root);
    createRoot(root).render(<App accounts={accounts} samlResponse={samlResponse}/>);

} catch (error) {
    console.error('SAMLify: Fatal error:', error);

    // Show error UI with option to restore original page
    const root = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(root);
    createRoot(root).render(
        <ErrorFallback
            error={error instanceof Error ? error.message : String(error)}
            originalContent={originalContent}
        />
    );
}
