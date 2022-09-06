import { FC, PropsWithChildren, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ExportedData } from "@lasso/dataprep";
import { NotificationState } from "./notifications";
import { ModalRequest } from "./modals";
import { useProjectData } from "../hooks/useProjectData";
import { Loader } from "../components/Loader";

/**
 * Type definition of the context
 */
export interface AppContextType {
  notifications: Array<NotificationState>;
  modal?: ModalRequest<any, any>;
  data: ExportedData;
}

const initialContext: AppContextType = {
  notifications: [],
  modal: undefined,
  data: {
    bbox: [
      [0, 0],
      [0, 0],
    ],
    projects: [],
  },
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
  const { loading, error, data } = useProjectData();

  const [context, setContext] = useState<AppContextType>(initialContext);

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      data: data ? data : prev.data,
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
