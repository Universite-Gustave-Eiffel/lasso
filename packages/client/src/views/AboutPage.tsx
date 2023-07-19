import { FC, useEffect } from "react";
import { useLocale, useT } from "@transifex/react";

import { useLazyHttpGet } from "../hooks/useLazyHttpGet";
import { Markdown } from "../components/Markdown";
import { config } from "../config";
import { Layout } from "./layout/index";
import { NotFoundPage } from "./NotFoundPage";
import { AxiosError } from "axios";

export const AboutPage: FC = () => {
  const t = useT();
  const locale = useLocale();

  const { loading, data, fetch } = useLazyHttpGet<{ page: string }, {}, string>({
    path: `${config.data_path}/{page}`,
  });

  /**
   * When locale changed, we fetch the markdown content.
   * Firstly we try the content of the current locale
   * If not found, we take the default one.
   */
  useEffect(() => {
    fetch({
      pathParams: { page: `about.${locale}.md` },
    }).catch((e) => {
      if (e instanceof AxiosError && e.code === "ERR_BAD_REQUEST" && locale !== config.defaultLocale) {
        fetch({
          pathParams: { page: `about.${config.defaultLocale}.md` },
        });
      }
    });
  }, [locale, fetch]);

  return (
    <>
      {!loading && !data ? (
        <NotFoundPage />
      ) : (
        <Layout heading={t("About")}>
          <div className="container col-sm-8 md-larger">
            <Markdown content={data ?? ""} />
          </div>
        </Layout>
      )}
    </>
  );
};
