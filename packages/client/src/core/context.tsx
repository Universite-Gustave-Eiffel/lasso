import { FC, PropsWithChildren, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Project } from "@lasso/dataprep";
import { NotificationState } from "./notifications";
import { ModalRequest } from "./modals";
import { useProjectList } from "../hooks/api/useProjectList";
import { Loader } from "../components/Loader";

/**
 * Type definition of the context
 */
export interface AppContextType {
  notifications: Array<NotificationState>;
  modal?: ModalRequest<any, any>;
  projects: Array<Project>;
}

const initialContext: AppContextType = {
  notifications: [],
  modal: undefined,
  projects: [],
};

export type AppContextSetter = (value: AppContextType | ((prev: AppContextType) => AppContextType)) => void;

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
export const AppContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const { loading, error, data } = useProjectList();

  const [context, setContext] = useState<AppContextType>(initialContext);

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      projects: data ? data : [],
    }));
  }, [data]);

  useEffect(() => {
    if (error) navigate("/error");
  }, [error, navigate]);

  return (
    <AppContext.Provider value={{ context, setContext }}>
      <>{loading ? <Loader /> : children}</>
    </AppContext.Provider>
  );
};
