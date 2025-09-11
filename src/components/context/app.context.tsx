import { createContext, useContext, useEffect, useState } from "react";
import { fetchAccountAPI } from "../../services/api";
import type { IFetchUser } from "../../types/user";

interface IAppContext {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  setUser: (v: IFetchUser | null) => void;
  user: IFetchUser | null;
  isLoading: boolean;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IFetchUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetchAccountAPI();
        if (res && res.userId) {
          setUser(res);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccount();
  }, []);
  return (
    <>
      <CurrentAppContext.Provider
        value={{
          isAuthenticated,
          user,
          setIsAuthenticated,
          setUser,
          isLoading,
        }}
      >
        {props.children}
      </CurrentAppContext.Provider>
    </>
  );
};

export const useCurrentApp = () => {
  const currentAppContext = useContext(CurrentAppContext);

  if (!currentAppContext) {
    throw new Error(
      "useCurrentApp has to be used within <CurrentAppContext.Provider>"
    );
  }

  return currentAppContext;
};