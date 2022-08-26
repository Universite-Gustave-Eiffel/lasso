import { FC, PropsWithChildren } from "react";

import { Notifications } from "../../core/notifications";
import { Modals } from "../../core/modals";
import { Loader } from "../../components/Loader";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Heading } from "./Heading";

interface LayoutProps {
  loading?: boolean;
  heading?: string | JSX.Element;
  headingTools?: JSX.Element;
}
export const Layout: FC<PropsWithChildren<LayoutProps>> = ({ heading, headingTools, loading, children }) => {
  return (
    <div id="app-root">
      <Header />
      <main className="container">
        <div className="row">
          <Heading heading={heading} headingTools={headingTools} />
          {children}
        </div>
      </main>

      <Notifications />
      <Modals></Modals>

      <Footer />
      {loading && <Loader />}
    </div>
  );
};
