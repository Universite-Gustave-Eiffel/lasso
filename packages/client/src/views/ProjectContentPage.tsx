import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";

import { config } from "../config";
import { useCurrentProject } from "../hooks/useProject";
import { useHttpGet } from "../hooks/useHttpGet";
import { Markdown } from "../components/Markdown";
import { Error } from "../components/Error";
import { Layout } from "./layout";
import { NotFoundPage } from "./NotFoundPage";

export const ProjectContentPage: FC = () => {
  const { id, page } = useParams<"id" | "page">();

  const { project, loading: loadingProject } = useCurrentProject(id);
  const { loading, data, error, fetch } = useHttpGet({
    path: `${config.data_path}/{id}/{page}.md`,
    pathParams: { id: id || null, page: page || null },
    queryParams: {},
  });

  useEffect(() => {
    fetch({
      pathParams: { id: id || null, page: page || null },
      queryParams: {},
    });
  }, [id, page, fetch]);

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
