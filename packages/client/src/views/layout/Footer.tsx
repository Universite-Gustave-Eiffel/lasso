import { FC } from "react";
import { useT } from "@transifex/react";

export const Footer: FC = () => {
  const t = useT();

  return (
    <footer className="d-flex flex-wrap justify-content-center align-items-center py-3 border-top bg-primary">
      <p className="mb-0">{t("footer.copyright")} &copy; 2022 Lasso</p>
    </footer>
  );
};
