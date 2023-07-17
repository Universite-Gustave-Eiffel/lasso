import { Project } from "@lasso/dataprep";
import { FC, PropsWithChildren } from "react";
import { BsChevronRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useT } from "@transifex/react";

import { LanguagePicker } from "../../components/LanguagePicker";

export const Header: FC<PropsWithChildren & { project?: Project }> = ({ project, children }) => {
  const t = useT();

  return (
    <header className="sticky-top  bg-primary">
      <div className="py-1 px-3 d-flex flex-column flex-md-row align-items-center">
        <Link to="/" title={t("page.home")} className="navbar-brand fs-2">
          <span>LASSO</span>
          {project ? (
            <>
              <BsChevronRight size="1.5rem" />
              <span>{project.name}</span>
            </>
          ) : null}
        </Link>

        {children}

        <nav className="d-inline-flex mt-2 mt-md-0 ms-md-auto navbar navbar-expand-lg">
          <div className="container-fluid">
            <Link to="/about" title={t("page.about")} className="me-1">
              {t("page.about")}
            </Link>
            <LanguagePicker />
          </div>
        </nav>
      </div>
    </header>
  );
};
