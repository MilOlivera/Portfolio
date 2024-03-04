
const Info = () => {

    return(
        <>
        <div className="about__info grid">
            <div className="about__box">

                <i className="bx bx-award about__icon"></i>
                <h3 className="about__title"> Experiencia</h3>
                <span className="about__subtitle">1 año realizando proyectos</span>
            </div>

            <div className="about__box">

                <i className="bx bx-briefcase-alt about__icon"></i>
                <h3 className="about__title">Proyectos</h3>
                <span className="about__subtitle">+5</span>
            </div>
            
            <div className="about__box">
                
                <i className="bx bxs-school about__icon"></i>
                <h3 className="about__title">Estudios</h3>
                <span className="about__subtitle">Tecnicatura en progreso, y cursos realizados en DigitalHouse y CoderHouse</span>
            </div>

        </div>
        </>
    )
}

export default Info;