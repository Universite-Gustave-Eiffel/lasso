import { FC, PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { LanguagePicker } from "../../components/LanguagePicker";

export const Header: FC<PropsWithChildren> = ({ children }) => {
  return (
    <header className="sticky-top border-bottom">
      <div className="py-1 px-3 d-flex flex-column flex-md-row align-items-center">
        <Link to="/" title="Home" className="navbar-brand">
          Lasso
        </Link>

        {children}

        <nav className="d-inline-flex mt-2 mt-md-0 ms-md-auto">
          <LanguagePicker />
        </nav>
      </div>
    </header>
  );
};
