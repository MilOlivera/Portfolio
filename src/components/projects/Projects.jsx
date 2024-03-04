import Proyectos from './Proyectos';
import './projects.css'

const Projects = () => {

    return(
        <>
            <section className="work section" id='portfolio'>
                <h2 className="section__title">Portfolio</h2>
                <span className="section__subtitle">Proyectos más recientes</span>

                <Proyectos />
            </section>
        </>
    )
}

export default Projects;