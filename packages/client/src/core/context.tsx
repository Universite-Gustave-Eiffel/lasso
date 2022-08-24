import { FC, createContext, useState, useEffect } from "react";

import { NotificationState } from "./notifications";
import { ModalRequest } from "./modals";

/**
 * Type definition of the context
 */
export interface AppContextType {
  portalTarget: HTMLDivElement | null;
  notifications: Array<NotificationState>;
  modal?: ModalRequest<any, any>;
}

const initialContext: AppContextType = {
  portalTarget: null,
  notifications: [],
  modal: undefined,
};

export type AppContextSetter = (
  value: AppContextType | ((prev: AppContextType) => AppContextType)
) => void;

/**
 * Application context.
 */
export const AppContext = createContext<{
  context: AppContextType;
  setContext: AppContextSetter;
} | null>(null);

/**
 * Application context provider.
 */
export const AppContextProvider: FC<{
  init: Partial<Omit<AppContextType, "server">>;
}> = ({ init, children }) => {
  const [context, setContext] = useState<AppContextType>({
    ...initialContext,
    ...init,
  });

  useEffect(() => {
    setContext({
      ...initialContext,
      ...init,
    });
  }, [init]);

  return (
    <AppContext.Provider value={{ context, setContext }}>
      <>{children}</>
    </AppContext.Provider>
  );
};
