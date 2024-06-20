import React, { useState, useContext, useRef, useEffect} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from "./Navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSearch, faUser, faGraduationCap, faFileCode } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/ELEVA.png";
import { UserContext } from '../../context/UserContext';
import { FiLogOut } from 'react-icons/fi';
 
const Navbar = () => {
   
    const [searchTerm, setSearchTerm] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentUser, setCurrentUser, setRoleC } = useContext(UserContext); 

    const dropdownRef = useRef(null);

    const navigate = useNavigate();

    const handleSearchInputChange = (event) => {
      setSearchTerm(event.target.value);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setMenuOpen(false); 
        }
      };
      document.body.addEventListener('click', handleClickOutside);
      return () => {
        document.body.removeEventListener('click', handleClickOutside);};
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('userDataEncriptado');
        setCurrentUser(null);
        setRoleC(null);
        navigate("/");
      };

    return (
      <nav className={styles.nav}>
         <button className={`${styles.userInfo} ${menuOpen ? styles.userInfoActive : ''}`} onClick={toggleMenu} ref={dropdownRef}>
          <FontAwesomeIcon icon={faUser} className={styles.userIcon} />
          <span className={styles.userName}>{currentUser.username}</span>
        </button>
        <NavLink to= "/">
        <img src={logo} alt="Logo" className={styles.logo} style={{ width: '50px', height: '60px' }} />
        </NavLink>
        <ul className={styles.nav__items}>

            <NavLink
              className={({ isActive }) =>
                `${isActive && styles.active} ${styles.nav__item}`
              }
              to="/"
            >
              <span className={styles.label}>Inicio</span>
              <FontAwesomeIcon icon={faHome} />
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `${isActive && styles.active} ${styles.nav__item}`
              }
              to="/User/MyCourses"
            >
              <span className={styles.label}>Mis Cursos</span>
              <FontAwesomeIcon icon={faGraduationCap} />
            </NavLink>


            <NavLink
              className={({ isActive }) =>
                `${isActive && styles.active} ${styles.nav__item}`
              }
              to="/User/PrueCod"
            >
              <span className={styles.label}>Probando Codigo</span>
              <FontAwesomeIcon icon={faFileCode} />
            </NavLink>


            <NavLink
              className={({ isActive }) =>
                `${isActive && styles.active} ${styles.nav__item}`
              }
              to="/User/Search"
            >
              <span className={styles.label}>
                {/* <input
                  className={styles.search__input}
                  variant="outlined"
                  type="text"
                  placeholder="Busqueda..."
                  value={searchTerm} 
                  onChange={handleSearchInputChange}
                 
                /> */}
              </span>
              <FontAwesomeIcon icon={faSearch} 
              
              />
            </NavLink>


        </ul>
        {menuOpen && (
        <ul className={styles.menu}>
            <li className={styles.menuItem}>
                <button onClick={handleLogout}>
                    <FiLogOut className={styles.userIcons}/>
                    <span className={styles.userNames}>Cerrar Sesión</span>
                </button>
            </li>
        </ul>
        )}
      </nav>
    );
  };
  
export default Navbar;