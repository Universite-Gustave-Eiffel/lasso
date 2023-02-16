import { FC } from "react";
import { useT } from "@transifex/react";

export const Footer: FC = () => {
  const t = useT();

  return (
    <footer className="d-flex flex-wrap justify-content-center align-items-center py-3  bg-primary">
      <p className="mb-0">{t("Copyright")} &copy; 2022-2023 - Exploratory I-Site Project LASSO - Analysis and modeling of the Localization and Activity of Sound Sources in urban spaces</p>
    </footer>
  );
};
