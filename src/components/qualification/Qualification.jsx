import { useState } from 'react';
import './qualification.css'

const Qualification = () => {

    const [toggleState, setToggleState] = useState(1)

    const toggleTab = (index) => {
        
        setToggleState(index);

    }

    return(
        <>
            <section className="qualification section" id="qualifications">
                <h2 className="section__title">Estudios</h2>
                <span className="section__subtitle">Mi recorrido!</span>

                <div className="qualification__container container">
                    <div className="qualification__tabs">
                        <div className={toggleState === 1 ? "qualification__button qualification__active button--flex"
                         : "qualification__button button--flex"} onClick={ () => toggleTab(1)}>
                            <i className="uil uil-graduation-cap qualification__icon"></i>Tech
                        </div>
                        
                        <div className={toggleState === 2 ? "qualification__button qualification__active button--flex" 
                        : "qualification__button button--flex"} onClick={ () => toggleTab(2)}>
                            <i className="bx bx-book qualification__icon"></i>General
                        </div>
                    </div>

                    <div className="qualification__sections">
                        <div className={toggleState === 1 ? "qualification__content qualification__content-active" 
                        : "qualification__content"}>
                            <div className="qualification__data">
                                <div>
                                    <h3 className="qualification__title">Tenicatura Superior en Programación</h3>
                                    <span className="qualification__subtitle">TECLAB</span>
                                    <div className="qualification__calendar">
                                        <i className="uil uil-calendar-alt"></i> Jun 2022 - Actualidad
                                    </div> 
                                </div>
                                
                                <div>
                                    <span className="qualification__rounder"></span>
                                    <span className="qualification__line"></span>
                                </div>
                            </div>
                            <div className="qualification__data">
                                <div></div>

                                <div>
                                    <span className="qualification__rounder"></span>
                                    <span className="qualification__line"></span>
                                </div>
                                
                                <div>
                                    <h3 className="qualification__title">React - Curso</h3>
                                    <span className="qualification__subtitle">CoderHouse</span>
                                    <div className="qualification__calendar">
                                        <i className="uil uil-calendar-alt"></i> Ago 2023 - Ago 2023
                                    </div> 
                                </div>
                               
                            </div>
                            <div className="qualification__data">
                                <div>
                                    <h3 className="qualification__title">Testing QA Manual - Curso</h3>
                                    <span className="qualification__subtitle">CoderHouse</span>
                                    <div className="qualification__calendar">
                                        <i className="uil uil-calendar-alt"></i> Oct 2022 - Oct 2022
                                    </div> 
                                </div>
                                
                                <div>
                                    <span className="qualification__rounder"></span>
                                    <span className="qualification__line"></span>
                                </div>
                            </div>
                            <div className="qualification__data">
                                <div></div>
                                <div>
                                    <span className="qualification__rounder"></span>
                                    <span className="qualification__line"></span>
                                </div>
                                <div>
                                    <h3 className="qualification__title">Full Stack Developer - Curso</h3>
                                    <span className="qualification__subtitle">Digital House</span>
                                    <div className="qualification__calendar">
                                        <i className="uil uil-calendar-alt"></i> Ene 2022 - Sep 2022
                                    </div> 
                                </div>
                                
                                
                            </div>
                            <div className="qualification__data">
                                <div>
                                    <h3 className="qualification__title">Wordpress - Curso</h3>
                                    <span className="qualification__subtitle">CoderHouse</span>
                                    <div className="qualification__calendar">
                                        <i className="uil uil-calendar-alt"></i> Ene 2022 - Ene 2022
                                    </div> 
                                </div>
                                
                                <div>
                                    <span className="qualification__rounder"></span>
                                    <span className="qualification__line"></span>
                                </div>
                            </div>
                            <div className="qualification__data">
                                <div></div>
                                <div>
                                    <span className="qualification__rounder"></span>
                                    <span className="qualification__line"></span>
                                </div>
                                <div>
                                    <h3 className="qualification__title">JavaScript - Curso</h3>
                                    <span className="qualification__subtitle">CoderHouse</span>
                                    <div className="qualification__calendar">
                                        <i className="uil uil-calendar-alt"></i> Nov 2021 - Ene 2022
                                    </div> 
                                </div>
                                
                                
                            </div>
                            
                        </div>

                        <div className={toggleState === 2 ? "qualification__content qualification__content-active" : "qualification__content"}>
                            <div className="qualification__data">
                                <div>
                                    <h3 className="qualification__title">Licenciatura en Transporte y Logistica Operativa</h3>
                                    <span className="qualification__subtitle">Universidad de la Marina Mercante</span>
                                    <div className="qualification__calendar">
                                        <i className="uil uil-calendar-alt"></i>Ago 2017 - Dic 2022
                                    </div> 
                                </div>
                                <div>
                                    <span className="qualification__rounder"></span>
                                    <span className="qualification__line"></span>
                                </div>
                            </div>
                            <div className="qualification__data">
                                
                                <div></div>
                                <div>
                                    <span className="qualification__rounder"></span>
                                    <span className="qualification__line"></span>
                                </div>
                                
                                <div>
                                    <h3 className="qualification__title">Marino Mercante - Oficial Fluvial</h3>
                                    <span className="qualification__subtitle">Escuela Nacional Fluvial</span>
                                    <div className="qualification__calendar">
                                        <i className="uil uil-calendar-alt"></i>Mar 2014 - Ene 2017
                                    </div>
                                </div>
                               
                            </div>
                            
                            
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Qualification;