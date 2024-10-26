import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import SaascannonSpaClient, { Options } from "@saascannon/spa";

type SaascannonSpaClientReact = Pick<
  SaascannonSpaClient,
  | "user"
  | "loginViaRedirect"
  | "signupViaRedirect"
  | "logoutViaRedirect"
  | "getAccessToken"
  | "hasPermissions"
  | "accountManagement"
  | "shopManagement"
>;

const SaascannonContext = createContext<SaascannonSpaClientReact | undefined>(
  undefined,
);

type SaascannonProviderProps = {
  children?: React.ReactNode;
  loading?: React.ReactNode;
  config: Options;
  clientInitialised?: (client: SaascannonSpaClient) => void;
};

export const SaascannonProvider = ({
  children,
  loading,
  config,
  clientInitialised,
}: SaascannonProviderProps): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const client = useRef<SaascannonSpaClient>();

  useEffect(() => {
    if (client.current) {
      return;
    }
    if (!client.current) {
      client.current = new SaascannonSpaClient(config).on(
        "auth-state-loaded",
        () => {
          console.log("auth state reloaded");
          if (clientInitialised && client.current) {
            clientInitialised(client.current);
          }
          setIsLoading(false);
          forceUpdate();
        },
      );
      client.current.loadAuthState();
    }
  }, [client.current]);

  if (!client.current || isLoading) {
    return <>{loading}</>;
  }

  return (
    <SaascannonContext.Provider
      value={{
        user: client.current.user,
        loginViaRedirect: client.current.loginViaRedirect.bind(client.current),
        signupViaRedirect: client.current.signupViaRedirect.bind(
          client.current,
        ),
        logoutViaRedirect: client.current.logoutViaRedirect.bind(
          client.current,
        ),
        getAccessToken: client.current.getAccessToken.bind(client.current),
        hasPermissions: client.current.hasPermissions.bind(client.current),
        accountManagement: client.current.accountManagement,
        shopManagement: client.current.shopManagement,
      }}
    >
      {children}
    </SaascannonContext.Provider>
  );
};

export const useSaascannon: () => SaascannonSpaClientReact = () => {
  const context = useContext(SaascannonContext);

  if (!context) {
    throw new Error(
      "No <SaascannonProvider>...</SaascannonProvider> found when calling useSaascannon(), ensure that you have setup the SaascannonProvider above this level in your application",
    );
  }

  return context;
};
