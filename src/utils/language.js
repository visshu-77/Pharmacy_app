import i18n from "../i18n/i18n";

export const changeLanguage = async (language) => {

    const languageCode =
        language === "Hindi"
            ? "hi"
            : "en";

    await i18n.changeLanguage(languageCode);

    localStorage.setItem("language", languageCode);
};