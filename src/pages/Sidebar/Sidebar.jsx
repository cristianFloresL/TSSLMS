import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css'; 
import { FiLogOut } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import { FaBars, FaTimes} from 'react-icons/fa';

const Sidebar = () => {
  const {setCurrentUser, setRoleC} = useContext(UserContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const handleLogout = () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('userDataEncriptado');
        setCurrentUser(null);
        setRoleC(null);
        navigate("/");
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 668) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        setIsVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);  

  const handleClose = () => {
    setIsVisible(false);
    setSidebarOpen(false);
  }
  const handleOpen = () => {
    setSidebarOpen(true);
    setIsVisible(true);
  }
  return (
    <div>
    {isSidebarOpen ? (
    <div className="admin-sidebar">
      {isVisible &&(
        <button  className= 'botond' onClick={handleClose}><FaTimes/></button>
      )}
      <img src="/image-1@2x.png" className='header-container ' width="80" height="80"/>
      <h2>Panel de Administrador</h2>
      <ul>
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/Admin/crear-curso">Crear Grupo</Link>
        </li>
        <li>
          <Link to="/Admin/recursos-curso">Recursos de un Curso</Link>
        </li>
      </ul>
      <div className="logout-button">
        <button onClick={handleLogout}>
          <FiLogOut />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
    ) : (
        <button className = 'botonf' onClick={handleOpen}><FaBars/></button>
      )}
    </div>
  );
};

export default Sidebar;