import { Config } from "./type";

export const config: Config = {
  importPath: process.env.DATAPREP_IMPORT_FOLDER || "./import",
  exportPath: process.env.DATAPREP_EXPORT_FOLDER || "../client/public/data",
};
