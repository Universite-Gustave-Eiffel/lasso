import { FC } from "react";

import { NotFound } from "../components/NotFound";
import { Layout } from "./layout";

export const NotFoundPage: FC = () => {
  return (
    <Layout>
      <NotFound />
    </Layout>
  );
};
