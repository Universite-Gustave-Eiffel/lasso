import { FC, useState, useEffect } from "react";
import { tx } from "@transifex/native";
import { useLanguages, useLocale } from "@transifex/react";
import localeEmoji from "locale-emoji";
import Select from "react-select";

type Option = { value: string; label: string };

export const LanguagePicker: FC = () => {
  const languages = useLanguages();
  const locale = useLocale();
  const [options, setOptions] = useState<Array<Option>>([]);

  useEffect(() => {
    setOptions(
      languages.map((lang: { code: string; localized_name: string }) => ({
        value: lang.code,
        label: `${localeEmoji(lang.code)} ${lang.localized_name}`,
      })),
    );
  }, [languages]);

  return (
    <Select<Option>
      isMulti={false}
      isClearable={false}
      isSearchable={false}
      options={options}
      value={options.find((o) => o.value === locale)}
      onChange={(o) => {
        if (o) tx.setCurrentLocale(o.value);
      }}
    />
  );
};
