import { useTranslation } from "react-i18next";
import "./footer.css";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer__container container">
        <h1 className="footer__title">{t("footer.name")}</h1>

        <ul className="footer__list">
          <li>
            <a href="#about" className="footer__link">
              {t("footer.links.about")}
            </a>
          </li>
          <li>
            <a href="#skills" className="footer__link">
              {t("footer.links.skills")}
            </a>
          </li>
          <li>
            <a href="#portfolio" className="footer__link">
              {t("footer.links.portfolio")}
            </a>
          </li>
          <li>
            <a href="#contact" className="footer__link">
              {t("footer.links.contact")}
            </a>
          </li>
        </ul>

        <div className="footer__social">
          <a
            href="https://www.instagram.com/MilOlivera"
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="uil uil-instagram"></i>
          </a>

          <a
            href="https://www.linkedin.com/in/milton-olivera"
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <i className="uil uil-linkedin"></i>
          </a>

          <a
            href="https://www.github.com/MilOlivera"
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <i className="uil uil-github"></i>
          </a>
        </div>

        <span className="footer__copy">
          &#169; {new Date().getFullYear()} {t("footer.name")} — {t("footer.rights")}
        </span>
      </div>
    </footer>
  );
};

export default Footer;