import { Project } from "@lasso/dataprep";
import { FC, PropsWithChildren } from "react";
import { BsChevronRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { LanguagePicker } from "../../components/LanguagePicker";

export const Header: FC<PropsWithChildren & { project?: Project }> = ({ project, children }) => {
  return (
    <header className="sticky-top border-bottom bg-primary">
      <div className="py-1 px-3 d-flex flex-column flex-md-row align-items-center">
        <Link to="/" title="Home" className="navbar-brand fs-2">
          <span>Lasso</span>
          {project ? (
            <>
              <BsChevronRight size="1.5rem" />
              <span>{project.name}</span>
            </>
          ) : null}
        </Link>

        {children}

        <nav className="d-inline-flex mt-2 mt-md-0 ms-md-auto">
          <LanguagePicker />
        </nav>
      </div>
    </header>
  );
};
