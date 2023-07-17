import { FC, PropsWithChildren } from "react";
import cx from "classnames";
import { Helmet } from "react-helmet";
import { isString } from "lodash";

import { Project } from "@lasso/dataprep";
import { Notifications } from "../../core/notifications";
import { Modals } from "../../core/modals";
import { Loader } from "../../components/Loader";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Heading } from "./Heading";

interface LayoutProps {
  loading?: boolean;
  fullPage?: boolean;
  project?: Project;
  heading?: string | JSX.Element;
  currentProjectPage?: string; //"maps" | "project" | "dataset" |  "sponsors" | "bibliography"
}
export const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  project,
  fullPage,
  heading,
  loading,
  children,
  currentProjectPage,
}) => {
  return (
    <div id="app-root">
      <Helmet>
        <title>{`Lasso - ${project ? project.name : isString(heading) ? heading : ""}`}</title>
      </Helmet>

      <Header project={project}>
        <Heading project={project} currentProjectPage={currentProjectPage} />
      </Header>

      <main className={cx(fullPage === true ? "d-flex align-self-stretch" : "container py-3")}>
        {!fullPage && <Heading heading={heading} />}
        {children}
      </main>

      <Notifications />
      <Modals></Modals>

      <Footer />
      {loading && <Loader />}
    </div>
  );
};
