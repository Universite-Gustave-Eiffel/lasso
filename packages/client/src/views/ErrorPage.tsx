import { FC } from "react";
import { Layout } from "./layout";
import { useT } from "@transifex/react";

export const ErrorPage: FC = () => {
  const t = useT();

  return <Layout heading={t("common.error")}></Layout>;
};
