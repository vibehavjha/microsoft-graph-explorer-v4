import { Configuration, PublicClientApplication } from '@azure/msal-browser';

function getClientIdFromWindow() {
  return (window as any).ClientId;
}

function getClientIdFromEnv() {
  return process.env.REACT_APP_CLIENT_ID;
}

const windowHasClientId = getClientIdFromWindow();
const clientId = 'e86bcb0e-f637-4f6c-b861-a4f908da442f';
export const configuration: Configuration = {
  auth: {
    clientId,
    clientCapabilities: ['CP1']
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true
  }
};


export const msalApplication = new PublicClientApplication(configuration);
