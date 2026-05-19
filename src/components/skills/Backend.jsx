import { useTranslation } from "react-i18next";

const Backend = () => {
  const { t } = useTranslation();

  return (
    <div className="skills__content">
      <h3 className="skills__title">{t("skills.backend.title")}</h3>

      <div className="skills__box">
        <div className="skills__group">
          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">Node.js</h3>
              <span className="skills__level">{t("skills.levels.intermediate")}</span>
            </div>
          </div>

          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">Express</h3>
              <span className="skills__level">{t("skills.levels.intermediate")}</span>
            </div>
          </div>

          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">Prisma</h3>
              <span className="skills__level">{t("skills.levels.intermediate")}</span>
            </div>
          </div>

          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">PostgreSQL</h3>
              <span className="skills__level">{t("skills.levels.intermediate")}</span>
            </div>
          </div>

          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">MySQL</h3>
              <span className="skills__level">{t("skills.levels.intermediate")}</span>
            </div>
          </div>
        </div>

        <div className="skills__group">
          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">MongoDB</h3>
              <span className="skills__level">{t("skills.levels.basic")}</span>
            </div>
          </div>

          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">Supabase</h3>
              <span className="skills__level">{t("skills.levels.intermediate")}</span>
            </div>
          </div>

          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">Firebase</h3>
              <span className="skills__level">{t("skills.levels.basic")}</span>
            </div>
          </div>

          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">NextAuth</h3>
              <span className="skills__level">{t("skills.levels.intermediate")}</span>
            </div>
          </div>

          <div className="skills__data">
            <i className="bx bx-badge-check"></i>
            <div>
              <h3 className="skills__name">Git / GitHub</h3>
              <span className="skills__level">{t("skills.levels.advanced")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backend;