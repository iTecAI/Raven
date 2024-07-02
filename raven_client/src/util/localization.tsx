import { ReactNode } from "react";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

import * as langEn from "../lang/en.json";

i18n.use(initReactI18next) // bind react-i18next to the instance
    .init({
        fallbackLng: "en",
        debug: true,

        interpolation: {
            escapeValue: false, // not needed for react!!
        },
        resources: {
            en: {
                translation: langEn,
            },
        },
    });

export function LocalizationProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
