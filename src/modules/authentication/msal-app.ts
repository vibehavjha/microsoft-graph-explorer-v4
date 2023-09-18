import { Configuration, PublicClientApplication } from '@azure/msal-browser';

function getClientIdFromWindow() {
  return (window as any).ClientId;
}

function getClientIdFromEnv() {
  return process.env.REACT_APP_CLIENT_ID;
}

const windowHasClientId = getClientIdFromWindow();
const clientId = '4232cb55-076a-47ff-946c-59093148f5e3';
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
