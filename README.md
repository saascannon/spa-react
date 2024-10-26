# @saascannon/spa-react
React Wrapper for the [@saascannon/spa](https://www.npmjs.com/package/@saascannon/spa) package. It provides a context-based solution to integrate authentication and authorization functionalities provided by Saascannon into your React application. By using the `SaascannonProvider` component, you can manage authentication flows and access Saascannon's APIs through React hooks.

## Installation
Install the package via npm:

```bash
npm i @saascannon/spa-react
```


## Usage
1. Wrap your Application with SaascannonProvider

    First, wrap your application with `SaascannonProvider`. This component initializes the Saascannon client, manages loading states, and passes the client methods to the context for consumption within your React components.

    ```typescript
    import React from "react";
    import ReactDOM from "react-dom";
    import { SaascannonProvider } from "@saascannon/spa-react";
    import App from "./App";
    import { apiClient } from "./utils/api"

    const saascannonConfig = {
        domain: "your-domain.region.saascannon.app",
        clientId: "your-client-id",
        redirectUri: "http://localhost:3000/callback",
    };

    ReactDOM.render(
        <SaascannonProvider 
            config={saascannonConfig} 
            loading={<div>Loading...</div>}
            clientInitialised={(client) => {
                try {
                    apiClient.config.TOKEN = async () => {
                    const accessToken = await client.getAccessToken();

                    if (accessToken === null) {
                        throw "Invalid access token";
                    }

                    return accessToken;
                    };
                } finally {
                    setLoadingAuthState(false);
                }
            }}
        >
            <App />
        </SaascannonProvider>,
        document.getElementById("root"),
    );
    ```
    The `SaascannonProvider` component takes the following props:

    - `config` (required): An object containing configuration options (see type Options for details).
    - `loading` (optional): A React node that will be displayed while the Saascannon client is loading.
    - `clientInitialised` (optional): A callback function that will be invoked once the client is initialized. This is useful for setting up any global usage of the saascannon methods (like shown in the example for setting up access token middleware) as you have direct access to the underlying client during this function call.


2. Access Saascannon Client Methods via `useSaascannon` Hook

    Inside any child component, you can access the Saascannon client and call its methods by using the `useSaascannon` hook.

    ```tsx
    import React, { useEffect } from "react";
    import { useSaascannon } from "@saascannon/spa-react";

    const MyComponent = () => {
        const {
            user,
            loginViaRedirect,
            signupViaRedirect,
            logoutViaRedirect,
            getAccessToken,
            hasPermissions,
            accountManagement,
            shopManagement,
        } = useSaascannon();

        return (
            <div>
                {user ? (
                    <>
                        <h2>Welcome, {user.name}!</h2>
                        <button onClick={() => logoutViaRedirect()}>Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => loginViaRedirect()}>Login</button>
                        <button onClick={() => signupViaRedirect()}>Sign Up</button>
                    </>
                )}
                <div>
                    {hasPermissions("admin") ? (
                        <p>You have admin access</p>
                    ) : (
                        <p>You do not have admin access</p>
                    )}
                </div>
            </div>
        );
    };

    export default MyComponent;
    ```

### Saascannon Methods Available through useSaascannon

The following methods are available from the `useSaascannon` hook:

| Method               | Description                                                              |
|----------------------|--------------------------------------------------------------------------|
| `user`              | Current authenticated user object, or `null` if not authenticated.       |
| `loginViaRedirect`  | Initiates a login flow redirect.                                         |
| `signupViaRedirect` | Initiates a signup flow redirect.                                        |
| `logoutViaRedirect` | Logs out the user and redirects them as configured.                      |
| `getAccessToken`    | Returns an access token if the user is authenticated.                    |
| `hasPermissions`    | Checks if the user has specific permissions.                             |
| `accountManagement` | Provides access to account management functions.                         |
| `shopManagement`    | Provides access to shop management functions.                            |


### Configuration Options
The config object passed to SaascannonProvider includes:

| Option             | Type                | Required | Description                                                             |
|--------------------|---------------------|----------|-------------------------------------------------------------------------|
| `domain`           | `string`            | Yes      | Your Saascannon domain.                                                 |
| `clientId`         | `string`            | Yes      | The Client ID associated with your application.                         |
| `redirectUri`      | `string`            | Yes      | The URI Saascannon redirects to after authentication.                   |
| `afterCallback`    | `function`          | No       | A callback that runs after authentication callback handling.            |
| `oAuthErrorHandler`| `function`          | No       | A handler function for OAuth errors.                                    |
| `uiBaseUrl`        | `string`            | No       | Base URL for your Saascannon UI, if different from the domain.          |


## Example
Here’s how you could use the `SaascannonProvider` and `useSaascannon` in a simple app:

```tsx
import React from "react";
import { SaascannonProvider, useSaascannon } from "@saascannon/spa-react";

const saascannonConfig = {
  domain: "your-domain.saascannon.com",
  clientId: "your-client-id",
  redirectUri: "http://localhost:3000/callback",
};

const Profile = () => {
  const { user, logoutViaRedirect, loginViaRedirect, shopManagement } = useSaascannon();

  return (
    <div>
      <h1>Welcome {user?.name || "Guest"}</h1>
      {user 
        ? <>
            <button onClick={() => logoutViaRedirect()}>Logout</button>
            <button onClick={() => shopManagement.open()}>Manage My Subscriptions</button>
          <>
        : <button onClick={() => loginViaRedirect()}>Login</button>
      }
    </div>
  );
};

const App = () => (
  <SaascannonProvider config={saascannonConfig} loading={<div>Loading...</div>}>
    <Profile />
  </SaascannonProvider>
);

export default App;
```
