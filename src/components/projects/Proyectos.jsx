import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { projectsData, projectsNav } from "./Data";
import ItemsProyectos from "./ItemProyectos";

const Proyectos = () => {
  const { t } = useTranslation();
  const [item, setItem] = useState({ name: "all" });
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (item.name === "all") {
      setProjects(projectsData);
    } else {
      const newProjects = projectsData.filter(
        (project) => project.category.toLowerCase() === item.name
      );
      setProjects(newProjects);
    }
  }, [item]);

  const handleClick = (categoryName, index) => {
    setItem({ name: categoryName });
    setActive(index);
  };

  return (
    <div>
      <div className="work__filters">
        {projectsNav.map((nav, index) => (
          <span
            onClick={() => handleClick(nav.name, index)}
            className={`${active === index ? "active-work" : ""} work__item`}
            key={index}
          >
            {t(nav.labelKey)}
          </span>
        ))}
      </div>

      <div className="work__container container grid">
        {projects.map((project) => (
          <ItemsProyectos item={project} key={project.id} />
        ))}
      </div>
    </div>
  );
};

export default Proyectos;