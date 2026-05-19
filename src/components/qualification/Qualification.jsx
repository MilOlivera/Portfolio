import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./qualification.css";

const Qualification = () => {
  const { t } = useTranslation();
  const [toggleState, setToggleState] = useState(1);

  const toggleTab = (index) => setToggleState(index);

  // Datos desde i18n (arrays)
  const techItems = t("qualification.tech", { returnObjects: true }) || [];
  const profItems = t("qualification.professional", { returnObjects: true }) || [];
  const generalItems = t("qualification.general", { returnObjects: true }) || [];

  // Renderiza un item alternando izquierda/derecha
  const renderItems = (items) =>
    items.map((item, i) => {
      const isLeft = i % 2 === 0;
      return (
        <div className="qualification__data" key={i}>
          {isLeft ? (
            <>
              <div>
                <h3 className="qualification__title">{item.title}</h3>
                <span className="qualification__subtitle">{item.place}</span>
                <div className="qualification__calendar">
                  <i className="uil uil-calendar-alt"></i> {item.date}
                </div>
              </div>
              <div>
                <span className="qualification__rounder"></span>
                <span className="qualification__line"></span>
              </div>
              <div></div>
            </>
          ) : (
            <>
              <div></div>
              <div>
                <span className="qualification__rounder"></span>
                <span className="qualification__line"></span>
              </div>
              <div>
                <h3 className="qualification__title">{item.title}</h3>
                <span className="qualification__subtitle">{item.place}</span>
                <div className="qualification__calendar">
                  <i className="uil uil-calendar-alt"></i> {item.date}
                </div>
              </div>
            </>
          )}
        </div>
      );
    });

  return (
    <section className="qualification section" id="qualifications">
      <h2 className="section__title">{t("qualification.title")}</h2>
      <span className="section__subtitle">{t("qualification.subtitle")}</span>

      <div className="qualification__container container">
        <div className="qualification__tabs">
          <div
            className={
              toggleState === 1
                ? "qualification__button qualification__active button--flex"
                : "qualification__button button--flex"
            }
            onClick={() => toggleTab(1)}
          >
            <i className="uil uil-graduation-cap qualification__icon"></i>
            {t("qualification.tabs.tech")}
          </div>

          <div
            className={
              toggleState === 2
                ? "qualification__button qualification__active button--flex"
                : "qualification__button button--flex"
            }
            onClick={() => toggleTab(2)}
          >
            <i className="uil uil-briefcase-alt qualification__icon"></i>
            {t("qualification.tabs.professional")}
          </div>

          <div
            className={
              toggleState === 3
                ? "qualification__button qualification__active button--flex"
                : "qualification__button button--flex"
            }
            onClick={() => toggleTab(3)}
          >
            <i className="bx bx-book qualification__icon"></i>
            {t("qualification.tabs.general")}
          </div>
        </div>

        <div className="qualification__sections">
          <div
            className={
              toggleState === 1
                ? "qualification__content qualification__content-active"
                : "qualification__content"
            }
          >
            {renderItems(techItems)}
          </div>

          <div
            className={
              toggleState === 2
                ? "qualification__content qualification__content-active"
                : "qualification__content"
            }
          >
            {renderItems(profItems)}
          </div>

          <div
            className={
              toggleState === 3
                ? "qualification__content qualification__content-active"
                : "qualification__content"
            }
          >
            {renderItems(generalItems)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Qualification;