import './footer.css'


const Footer = () => {

    return (
        <>
        <footer className="footer">
            <div className="footer__container container">

                <h1 className="footer__title">Milton H. Olivera</h1>

                <ul className="footer__list">
                    <li>
                        <a href="#about" className="footer__link">Acerca</a>
                    </li>
                    <li>
                        <a href="#skills" className="footer__link">Skills</a>
                    </li>
                    <li>
                        <a href="#portfolio" className="footer__link">Proyectos</a>
                    </li>
                </ul>

                <div className="footer__social">
                <a href="https://www.instagram.com/MilOlivera" className="footer__social-link" target="{_blank}">
                    <i className="uil uil-instagram"></i>
                </a>
            
                <a href="https://www.linkedin.com/in/milton-olivera" className="footer__social-link" target="{_blank}">
                    <i className="uil uil-linkedin"></i>

                </a>
            
                <a href="https://www.github.com/MilOlivera" className="footer__social-link" target="{_blank}">
                    <i className="uil uil-github"></i>

                </a>

                </div>

                {/* <span className="footer__copy">
                    &#169; Milton H. Olivera - Todos los derechos reservados
                </span> */}
            </div>
        </footer>
        </>
    )
}

export default Footer;