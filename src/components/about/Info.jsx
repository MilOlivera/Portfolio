import { useTranslation } from "react-i18next";

const Info = () => {
  const { t } = useTranslation();

  return (
    <div className="about__info grid">
      <div className="about__box">
        <i className="bx bx-code-alt about__icon"></i>
        <h3 className="about__title">5+</h3>
        <span className="about__subtitle">{t("about.stats.experience")}</span>
      </div>

      <div className="about__box">
        <i className="bx bx-anchor about__icon"></i>
        <h3 className="about__title">9</h3>
        <span className="about__subtitle">{t("about.stats.marine")}</span>
      </div>

      <div className="about__box">
        <i className="bx bx-briefcase-alt about__icon"></i>
        <h3 className="about__title">6+</h3>
        <span className="about__subtitle">{t("about.stats.completed")}</span>
      </div>
    </div>
  );
};

export default Info;