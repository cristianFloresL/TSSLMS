import React, { useState } from 'react';
import { FaAt } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import "./LoginForm.css";
import logo from "../../assets/ELEVA.png";
import { auth } from '../../connection/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import CircularProgress from '@mui/material/CircularProgress';

const PasswordResetForm = () => {
  const [nuevopd, setNuevopd] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorPwdVacio, setErrorPwdVacio] = useState("");
  const [errorPwdMinLength, setErrorPwdMinLength] = useState("");
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const handlePwdreset = async (e) => {
    setIsRegistering(true);
    e.preventDefault();
    setErrorPwdVacio("");
    setErrorPwdMinLength("");

    if (!nuevopd) {
      setErrorPwdVacio("Por favor, ingrese un correo");
      setIsRegistering(false);
      return;
    }

    if (nuevopd.length < 6) {
      setErrorPwdMinLength("Minimo 6 caracteres");
      setIsRegistering(false);
      return;
    }
    try {
      const emailAddress = nuevopd;
      await sendPasswordResetEmail(auth, emailAddress);
      setIsModalOpen(true);
      setIsRegistering(false);
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
          setErrorPwdVacio("Correo electrónico no registrado");
          setIsRegistering(false);
      } else {
          setErrorPwdVacio("Error al enviar correo de restablecimiento");
          setIsRegistering(false);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate("/"); 
  };

  const handleEmailChange = (e) => {
    setNuevopd(e.target.value);
    setErrorPwdVacio('');
    setErrorPwdMinLength('');
};

  return (
  <div className="ventanaEspecifica">
    <div className="password-reset-container">
      <Link to="/" className="logo"> 
        <img src={logo} alt="" /> 
      </Link>
      <div className="password-reset-box">
        <h6 className="mb-0 pb-3 text-center" style={{ fontSize: '15px', margin: 25 }}>Introduce el correo Registrado</h6>
        <div className="form-group">
          <span className="input-icons"><FaAt /></span>
          <input
            type={'text'}
            name="logpass"
            className="form-style"
            placeholder="Correo Electronico"
            value={nuevopd}
            onChange={handleEmailChange}
          />
          {errorPwdVacio && <p className="error2">{errorPwdVacio}</p>}
          {errorPwdMinLength && <p className="error2">{errorPwdMinLength}</p>}
        </div>
        <div className="mb-0 pb-3 text-center">
          <button className="btn mt-4" onClick={handlePwdreset}>
            {isRegistering ? <CircularProgress size={24} color="inherit" /> : 'Enviar'}
          </button>
        </div>
        <p className="mb-0 mt-4 text-center"><Link to ="/Gest/Login" className="link">Atrás</Link></p>
      </div>
      {isModalOpen && (
        <div className="password-reset-modal-overlay">
          <div className="password-reset-modal-content">
            <h4>Enviado con Exito</h4>
            <p>¡Se ha enviado a su correo Elctronico las instrucciones!</p>
            <button className="password-reset-modal-btn" onClick={handleModalClose}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default PasswordResetForm;