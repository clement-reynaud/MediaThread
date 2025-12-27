import i18next from "i18next";
import middleware from "i18next-http-middleware";
import Backend from "i18next-fs-backend";
import path from "path";

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "fr"],
    backend: {
      loadPath: path.join(__dirname, "../locales/{{lng}}/translation.json")
    },
    detection: {
      order: ["querystring", "cookie", "header"],
      caches: ["cookie"]
    },
    interpolation: {
      escapeValue: false // EJS already escapes
    }
  });

export default middleware.handle(i18next);
