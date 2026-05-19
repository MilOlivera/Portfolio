const Social = () => {
  return (
    <div className="home__social">
      <a
        href="https://www.instagram.com/MilOlivera"
        className="home__social-icon"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <i className="uil uil-instagram"></i>
      </a>

      <a
        href="https://www.linkedin.com/in/milton-olivera"
        className="home__social-icon"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <i className="uil uil-linkedin"></i>
      </a>

      <a
        href="https://www.github.com/MilOlivera"
        className="home__social-icon"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        <i className="uil uil-github"></i>
      </a>
    </div>
  );
};

export default Social;