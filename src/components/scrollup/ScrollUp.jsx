import { useEffect, useState } from "react";
import "./scrollup.css";

const ScrollUp = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY >= 560);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      href="#home"
      className={show ? "scrollup show-scroll" : "scrollup"}
      aria-label="Scroll to top"
    >
      <i className="uil uil-arrow-up scrollup__icon"></i>
    </a>
  );
};

export default ScrollUp;