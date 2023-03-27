# aws-saml-login-chrome-extension
Chrome Extension for a better UX experience for AWS Saml Login Page with multiple Accounts and Roles
- Provides the list of accounts in sorted order
- Ability to filter the accounts using search bar
- Sign In button at the top right corner for easier access

![](image.png)

## Build Instructions
- Use `npm run build` to build the distribution. Outputs will be created in ./dist directory
- Use `npm run watch` for watch mode

## Install Plugin on Chrome
- Open Google Chrome and go to the extensions page by clicking on the three dots at the top right of the browser and selecting "More tools" > "Extensions".
- Enable developer mode by toggling the switch at the top right of the page.
- Click on "Load unpacked" and select the dist folder
- The plugin should now be installed and visible in your extensions list.

## Install using provided archive
- Use the provided SAMLify.zip
- Extract it to a local folder
- Follow the instructions above on how to install plugin on chrome
