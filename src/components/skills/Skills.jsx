import './skills.css'
import Frontend from './Frontend';
import Backend from './Backend';

const Skills = () => {

    return (
        <>
            <section className="skills section" id="skills">
                <h2 className="section__title">Skills</h2>
                <span className="section__subtitle">Conocimiento tecnico - entre otros</span>
            </section>

            <div className="skills__container container grid">
                <Frontend />
                <Backend />
            </div>

        </>
    )
}

export default Skills;