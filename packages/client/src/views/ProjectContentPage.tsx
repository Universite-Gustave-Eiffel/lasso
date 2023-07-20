import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLocale } from "@transifex/react";

import { config } from "../config";
import { getI18NText } from "../utils/i18n";
import { useCurrentProject } from "../hooks/useProject";
import { useLazyHttpGet } from "../hooks/useLazyHttpGet";
import { Markdown } from "../components/Markdown";
import { Error } from "../components/Error";
import { Layout } from "./layout";
import { NotFoundPage } from "./NotFoundPage";

export const ProjectContentPage: FC = () => {
  const { id, page } = useParams<"id" | "page">();
  const locale = useLocale();
  const { project, loading: loadingProject } = useCurrentProject(id);

  const { loading, data, error, fetch } = useLazyHttpGet({
    path: `${config.data_path}/{id}/{page}`,
  });

  useEffect(() => {
    if (page && project && project.pages[page]) {
      fetch({
        pathParams: { id: project.id, page: getI18NText(locale, project.pages[page]) },
        queryParams: {},
      });
    }
  }, [page, fetch, locale, project]);

  return (
    <>
      {!(loading || loadingProject) && (!project || !data) ? (
        <NotFoundPage />
      ) : (
        <Layout loading={loading || loadingProject} project={project ?? undefined} currentProjectPage={page || "maps"}>
          <>
            <div className="row">
              <div className="col-2" />
              <div className="col-8">
                <Markdown content={data as unknown as string} />
              </div>
              <div className="col-2" />
            </div>
            {error && <Error error={error} />}
          </>
        </Layout>
      )}
    </>
  );
};
