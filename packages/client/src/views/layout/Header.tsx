import { FC } from "react";
import { Link } from "react-router-dom";
import { LanguagePicker } from "@transifex/react";

export const Header: FC = () => {
  return (
    <header className="sticky-top border-bottom">
      <div className="py-1 px-3 d-flex flex-column flex-md-row align-items-center">
        <Link to="/" title="Home" className="navbar-brand">
          Lasso
        </Link>

        <nav className="d-inline-flex mt-2 mt-md-0 ms-md-auto">
          <LanguagePicker />
          <ul className="nav nav-pills">
            <li className="nav-item"></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
