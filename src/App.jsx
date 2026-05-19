import "./App.css";
import { WeatherProvider } from "./context/WeatherContext";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import About from "./components/about/About";
import Skills from "./components/skills/Skills";
import Qualification from "./components/qualification/Qualification";
import Contact from "./components/contact/Contact";
import Footer from "./components/footer/Footer";
import Projects from "./components/projects/Projects";
import ScrollUp from "./components/scrollup/ScrollUp";
import WeatherScene from "./components/weatherScene/WeatherScene";
import ShipNavigator from "./components/ship/ShipNavigator";

function App() {
  return (
    <WeatherProvider>
      {/* Capa de clima fixed (cubre todo el viewport) */}
      <WeatherScene />

      <Header />

      {/* Wrapper relative para que el ShipNavigator se posicione respecto al body */}
      <div className="app__content">
        <ShipNavigator />

        <main className="main">
          <Home />
          <About />
          <Skills />
          <Qualification />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>

      <ScrollUp />
    </WeatherProvider>
  );
}

export default App;