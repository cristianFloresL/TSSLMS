import { useCallback } from "react";
import "./Landing.css";
import { Link } from 'react-router-dom';

const Landing = () => {
  const onPricingClick = useCallback(() => {
    window.location.href = "https://www.umss.edu.bo/";
  }, []);

  const onSupportClick = useCallback(() => {
    window.location.href = "http://www.fcyt.umss.edu.bo/";
  }, []);

  const onImage2Click = useCallback(() => {
    window.location.href = "http://www.fcyt.umss.edu.bo/";
  }, []);

  const onImage3Click = useCallback(() => {
    window.location.href = "https://www.umss.edu.bo/";
  }, []);

  return (
    <div className="hero-06">
      <div className="nav-bar">
        <button className="logon">
          <img className="image-1-icon" alt="" src="/image-1@2x.png" />
          <div className="ovonrueden">SISMODE</div>
        </button>
        <div className="menu">
          <button className="about">Acerca de</button>
          <button className="about">Contacto</button>
          <a className="pricing" onClick={onPricingClick}>
            UMSS
          </a>
          <a className="pricing" onClick={onSupportClick}>
            FCYT
          </a>
        </div>
      </div>
      <div className="content">
        <div className="heading-logo">
          <div className="heading-cta">
            <div className="heading-text">
              <div className="find-the-most">
                Sistema de Aprendizaje y Modelos de Desarrollo
              </div>
              <div className="vestibulum-placerat">
              La plataforma de LMS y centro de contenido integral 
              para la simulación de sistemas, ofreciendo una experiencia 
              educativa e interactiva, diseñada para los 
              estudiantes de la Universidad San Simón.
              </div>
            </div>
            <button className="cta-button">
              <Link to="/Gest/Login" className="cta-02">Inicia Sesión</Link>
            </button>
          </div>
          <div className="logo-cloud">
            <div className="heading">DESARROLLADO PARA:</div>
            <div className="logos">
              <button className="image-2" onClick={onImage2Click} />
              <a className="image-3" onClick={onImage3Click} />
            </div>
          </div>
        </div>
        <div className="design-parent">
          <div className="design">
            <img className="vector-icon" alt="" src="/vector.svg" />
          </div>
          <img className="frame-icon" alt="" src="/frame.svg" />
        </div>
      </div>
      <footer className="image" />
    </div>
  );
};

export default Landing;