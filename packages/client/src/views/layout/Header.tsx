import { Project } from "@lasso/dataprep";
import { FC, PropsWithChildren } from "react";
import { BsChevronRight, BsQuestionCircle } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useT, useLocale } from "@transifex/react";

import { LanguagePicker } from "../../components/LanguagePicker";
import { getI18NText } from "../../utils/i18n";

export const Header: FC<PropsWithChildren & { project?: Project }> = ({ project, children }) => {
  const t = useT();
  const locale = useLocale();

  return (
    <header className="sticky-top  bg-primary">
      <div className="py-1 px-3 d-flex flex-column flex-md-row align-items-center">
        <Link to="/" title={t("page.home")} className="navbar-brand fs-2">
          <span>LASSO</span>
        </Link>
        {project ? (
          <>
            <BsChevronRight size="1.5rem" />
            <Link to={`/project/${project.id}`} title={getI18NText(locale, project.name)} className="navbar-brand fs-2">
              <span>{getI18NText(locale, project.name)}</span>
            </Link>
          </>
        ) : null}

        {children}

        <nav className="d-inline-flex mt-2 mt-md-0 ms-md-auto navbar navbar-expand-lg">
          <div className="container-fluid p-0">
            <LanguagePicker />
            <Link to="/about" title={t("About")} className="ms-3 px-1">
              <BsQuestionCircle size="1.4rem" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
