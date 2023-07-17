import { FC } from "react";
import { useT } from "@transifex/react";

import { Markdown } from "../components/Markdown";
import { Layout } from "./layout/index";

export const AboutPage: FC = () => {
  const t = useT();

  return (
    <Layout heading={t("page.about.title")}>
      <div className="container col-sm-8 md-larger">
        <Markdown content={t("page.about.content")} />
      </div>
    </Layout>
  );
};
