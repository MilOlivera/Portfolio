import { useTranslation } from "react-i18next";

const ItemsProyectos = ({ item }) => {
  const { t } = useTranslation();

  return (
    <div className="work__card">
      <img src={item.image} alt={t(item.titleKey)} className="work__img" />
      <h3 className="work__title">{t(item.titleKey)}</h3>
      <p className="work__description">{t(item.descriptionKey)}</p>

      <div className="work__stack">
        {item.stack.map((tech, i) => (
          <span className="work__stack-pill" key={i}>
            {tech}
          </span>
        ))}
      </div>

      {item.demo && item.demo !== "#" ? (
        <a href={item.demo} target="_blank" rel="noopener noreferrer" className="work__button">
          {t("projects.viewDemo")}
          <i className="bx bx-right-arrow-alt work__button-icon"></i>
        </a>
      ) : (
        <span className="work__button work__button--disabled">
          {t("projects.privateProject")}
          <i className="bx bx-lock-alt work__button-icon"></i>
        </span>
      )}
    </div>
  );
};

export default ItemsProyectos;