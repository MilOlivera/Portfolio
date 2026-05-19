import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import WeatherChip from "../weather/WeatherChip";
import "./header.css";

const Header = () => {
  const { t, i18n } = useTranslation();
  const [toggle, showMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("#home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY >= 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language?.startsWith("en") ? "en" : "es";

  return (
    <div className={scrolled ? "header scroll-header" : "header"}>
      <nav className="nav container">
        <a href="index.html" className="nav__logo">
          Milton Olivera
        </a>

        <div className={toggle ? "nav__menu show-menu" : "nav__menu"}>
          <ul className="nav__list grid">
            <li className="nav__item">
              <a
                href="#home"
                onClick={() => {
                  setActiveNav("#home");
                  showMenu(false);
                }}
                className={
                  activeNav === "#home" ? "nav__link active-link" : "nav__link"
                }
              >
                <i className="uil uil-estate nav__icon"></i>
                {t("header.home")}
              </a>
            </li>

            <li className="nav__item">
              <a
                href="#about"
                onClick={() => {
                  setActiveNav("#about");
                  showMenu(false);
                }}
                className={
                  activeNav === "#about" ? "nav__link active-link" : "nav__link"
                }
              >
                <i className="uil uil-user nav__icon"></i>
                {t("header.about")}
              </a>
            </li>

            <li className="nav__item">
              <a
                href="#skills"
                onClick={() => {
                  setActiveNav("#skills");
                  showMenu(false);
                }}
                className={
                  activeNav === "#skills" ? "nav__link active-link" : "nav__link"
                }
              >
                <i className="uil uil-file-alt nav__icon"></i>
                {t("header.skills")}
              </a>
            </li>

            <li className="nav__item">
              <a
                href="#qualifications"
                onClick={() => {
                  setActiveNav("#qualifications");
                  showMenu(false);
                }}
                className={
                  activeNav === "#qualifications"
                    ? "nav__link active-link"
                    : "nav__link"
                }
              >
                <i className="uil uil-book nav__icon"></i>
                {t("header.qualifications")}
              </a>
            </li>

            <li className="nav__item">
              <a
                href="#portfolio"
                onClick={() => {
                  setActiveNav("#portfolio");
                  showMenu(false);
                }}
                className={
                  activeNav === "#portfolio"
                    ? "nav__link active-link"
                    : "nav__link"
                }
              >
                <i className="uil uil-scenery nav__icon"></i>
                {t("header.portfolio")}
              </a>
            </li>

            <li className="nav__item">
              <a
                href="#contact"
                onClick={() => {
                  setActiveNav("#contact");
                  showMenu(false);
                }}
                className={
                  activeNav === "#contact"
                    ? "nav__link active-link"
                    : "nav__link"
                }
              >
                <i className="uil uil-message nav__icon"></i>
                {t("header.contact")}
              </a>
            </li>
          </ul>

          <i
            className="uil uil-times nav__close"
            onClick={() => showMenu(!toggle)}
          ></i>
        </div>

        <div className="nav__actions">
          {/* Weather chip con dropdown de ciudades */}
          <WeatherChip />

          {/* Toggle de idioma con banderas */}
          <div className="lang__switch" role="group" aria-label="Language selector">
            <button
              onClick={() => changeLanguage("es")}
              className={
                currentLang === "es"
                  ? "lang__btn lang__btn--active"
                  : "lang__btn"
              }
              aria-label="Español"
              title="Español"
            >
              🇦🇷
            </button>
            <button
              onClick={() => changeLanguage("en")}
              className={
                currentLang === "en"
                  ? "lang__btn lang__btn--active"
                  : "lang__btn"
              }
              aria-label="English"
              title="English"
            >
              🇬🇧
            </button>
          </div>

          <div className="nav__toggle" onClick={() => showMenu(!toggle)}>
            <i className="uil uil-apps"></i>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;