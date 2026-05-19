import { useTranslation } from "react-i18next";
import Proyectos from "./Proyectos";
import "./projects.css";

const Projects = () => {
  const { t } = useTranslation();

  return (
    <section className="work section" id="portfolio">
      <h2 className="section__title">{t("projects.title")}</h2>
      <span className="section__subtitle">{t("projects.subtitle")}</span>

      <Proyectos />
    </section>
  );
};

export default Projects;