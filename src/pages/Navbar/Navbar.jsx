import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from "./Navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSearch, faUser, faGraduationCap, faFileCode, faVideo} from "@fortawesome/free-solid-svg-icons";
import { FaComments, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import logo from "../../assets/ELEVA.png";
import { UserContext } from '../../context/UserContext';
import { SearchContext } from '../../context/SearchContext';
import { FiLogOut } from 'react-icons/fi';
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from '../../connection/firebaseConfig';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentUser, setCurrentUser, setRoleC } = useContext(UserContext);
    const dropdownRef = useRef(null);
    const { searchTerm, setSearchTerm } = useContext(SearchContext);
    const [isVisible, setIsVisible] = useState(false);
    const [menuActive, setMenuActive] = useState(false);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('mensajes');
    const [showMensajes, setShowMensajes] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [conversationContacts, setConversationContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [mensajeInput, setMensajeInput] = useState('');
    const mensajesRef = useRef(null);
    const messagesListRef = useRef(null);
    const bottomRef = useRef(null);

    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            const hamburger = document.querySelector(`.${styles.hamburg}`);
            if (hamburger) {
                setIsVisible(window.getComputedStyle(hamburger).display !== 'none');
            }
        };
        handleResize(); // Call once to set initial state
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMen = () => {
        setMenuActive(!menuActive);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setMenuOpen(false);
          }
          if (mensajesRef.current && !mensajesRef.current.contains(event.target)) {
            setShowMensajes(false);
          }
        };
        document.body.addEventListener('click', handleClickOutside);
        return () => {
            document.body.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('userDataEncriptado');
        setCurrentUser(null);
        setRoleC(null);
        navigate("/");
    };

    const toggleMensajes = async () => {
      setShowMensajes(!showMensajes);
      if (!showMensajes) {
        await fetchContacts();
        await fetchConversationContacts();
      }
    };
  
    const fetchContacts = async () => {
      const q = query(collection(firestore, "users"));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.email !== currentUser.email) {
          users.push(user);
        }
      });
      setContacts(users);
    };
  
    const fetchConversationContacts = async () => {
      const sentQuery = query(collection(firestore, "messages"), where("senderEmail", "==", currentUser.email), orderBy("timestamp", "desc"));
      const receivedQuery = query(collection(firestore, "messages"), where("receiverEmail", "==", currentUser.email), orderBy("timestamp", "desc"));
      const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(sentQuery), getDocs(receivedQuery)]);
      const contactsMap = new Map(); // Use a Map to avoid duplicate contacts
      sentSnapshot.forEach((doc) => {
        const contact = doc.data();
        if (!contactsMap.has(contact.receiverEmail)) {
          contactsMap.set(contact.receiverEmail, {
            email: contact.receiverEmail,
            username: contact.receiverUsername,
            role: contact.receiverRole,
            lastMessageDate: contact.timestamp
          });
        }
      });
    
      receivedSnapshot.forEach((doc) => {
        const contact = doc.data();
        if (!contactsMap.has(contact.senderEmail)) {
          contactsMap.set(contact.senderEmail, {
            email: contact.senderEmail,
            username: contact.senderUsername,
            role: contact.senderRole,
            lastMessageDate: contact.timestamp
          });
        } else {
          if (contact.timestamp > contactsMap.get(contact.senderEmail).lastMessageDate) {
            contactsMap.set(contact.senderEmail, {
              email: contact.senderEmail,
              username: contact.senderUsername,
              role: contact.senderRole,
              lastMessageDate: contact.timestamp
            });
          }
        }
      });
    
      const contacts = Array.from(contactsMap.values()).sort((a, b) => b.lastMessageDate - a.lastMessageDate);
    
      setConversationContacts(contacts);
    };    
  
    const fetchMessages = async (contactEmail) => {
      const q = query(
        collection(firestore, "messages"),
        where("senderEmail", "in", [currentUser.email, contactEmail]),
        where("receiverEmail", "in", [currentUser.email, contactEmail]),
        orderBy("timestamp", "asc")
      );
    
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          const message = doc.data();
          if (message.senderEmail === message.receiverEmail) {
            if (message.receiverEmail === currentUser.email && contactEmail === currentUser.email) {
              messages.push(message);
            }
          } else {
            messages.push(message);
          }
        });
        setMessages(messages);
        scrollToBottom();
      });
      return unsubscribe;
    };
  
    const scrollToBottom = () => {
      setTimeout(() => {
        if (messagesListRef.current) {
          messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
        }
      }, 200);
    };
  
    const handleContactClick = async (contact) => {
      setSelectedContact(contact);
      const unsubscribe = await fetchMessages(contact.email);
      setTimeout(() => {
        setShowMensajes(true);
      }, 100);
      return () => unsubscribe();
    };
  
    const handleBackClick = () => {
      setSelectedContact(null);
      setTimeout(() => {
        setShowMensajes(true);
        fetchConversationContacts();
      }, 100);
    };
  
    const handleMensajeSubmit = async (e) => {
      e.preventDefault();
  
      if (!mensajeInput.trim() || !selectedContact) return;
  
      const newMensaje = {
        senderEmail: currentUser.email,
        senderUsername: currentUser.username,
        senderRole: currentUser.role,
        receiverEmail: selectedContact.email,
        receiverUsername: selectedContact.username,
        receiverRole: selectedContact.role,
        contenido: mensajeInput,
        timestamp: new Date(),
      };
  
      await addDoc(collection(firestore, "messages"), newMensaje);
      setMensajeInput('');
      scrollToBottom();
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
      <div className={`${styles.hamburg} ${menuActive ? styles.active : ''}`} onClick={toggleMen}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={styles.mensajescontainer} ref={mensajesRef}>
        <button className={`${styles.bellicon} ${showMensajes ? styles.active : ''}`} onClick={toggleMensajes}>
          <FaComments/>
        </button>
        {showMensajes && (
          <div className={styles.mensajesmenu}>
            {selectedContact ? (
              <div>
                <div className={styles.chatheader}>
                  <button className={styles.backbutton} onClick={handleBackClick}>
                    <FaArrowLeft />
                  </button>
                  <h3>{selectedContact.username}</h3>
                </div>
                <div className={styles.chatcontainer}>
                  <div className={styles.messageslist} ref={messagesListRef}>
                    {messages.map((mensaje) => (
                      <div key={mensaje.id} className={`${styles.message} ${mensaje.senderEmail === currentUser.email ? styles.sent : styles.received}`}>
                        <p>{mensaje.contenido}</p>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                  <form className={styles.messageform} onSubmit={handleMensajeSubmit}>
                    <input
                      type='text'
                      className={styles.messageinput}
                      placeholder='Escribe un mensaje'
                      value={mensajeInput}
                      onChange={(e) => setMensajeInput(e.target.value)}
                    />
                    <button type='submit' className={styles.messagesubmit}>
                      <FaPaperPlane />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div>
                <div className={styles.mensajestabs}>
                  <button onClick={() => setActiveTab('mensajes')} className={activeTab === 'mensajes' ? styles.mensajeactive : ''}>Mensajes</button>
                  <button onClick={() => setActiveTab('usuarios')} className={activeTab === 'usuarios' ? styles.mensajeactive : ''}>Usuarios</button>
                  <button onClick={() => setActiveTab('admin')} className={activeTab === 'admin' ? styles.mensajeactive : ''}>Admin</button>
                </div>
                <div className={styles.mensajescontent}>
                  <div className={styles.mensajessection} style={{ display: activeTab === 'mensajes' ? 'block' : 'none' }}>
                    <h2>Mensajes</h2>
                    {conversationContacts.length === 0 ? (
                      <p>No hay conversaciones abiertas.</p>
                    ) : (
                      conversationContacts.map((contact) => (
                        <div key={contact.email} className={styles.contactitem} onClick={() => handleContactClick(contact)}>
                          <p>{contact.username}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={styles.contactssection} style={{ display: activeTab === 'usuarios' || activeTab === 'admin' ? 'block' : 'none' }}>
                    <h2>{activeTab === 'usuarios' ? 'Usuarios' : 'Administradores'}</h2>
                    {contacts.filter((contact) => contact.role === (activeTab === 'usuarios' ? 'usuario' : 'admin')).map((contact) => (
                      <div key={contact.email} className={styles.contactitem} onClick={() => handleContactClick(contact)}>
                        <p>{contact.username}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
        {isVisible && menuActive && (
          <ul className={styles.nav__items_mobile}>
            <NavLink
              className={({ isActive }) =>
                `${isActive ? styles.active : ''} ${styles.nav__item}`
              }
              to="/"
              >
                <span className={styles.label}>Inicio</span>
                  <FontAwesomeIcon icon={faHome} />
            </NavLink>
            <NavLink
                className={({ isActive }) =>
                    `${isActive ? styles.active : ''} ${styles.nav__item}`
                }
                to="/User/MyCourses"
            >
            <span className={styles.label}>Mis Cursos</span>
            <FontAwesomeIcon icon={faGraduationCap} />
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `${isActive ? styles.active : ''} ${styles.nav__item}`
              }
              to="/User/PrueCod"
            >
              <span className={styles.label}>Probar Codigo</span>
              <FontAwesomeIcon icon={faFileCode} />
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `${isActive && styles.active} ${styles.nav__item}`
              }
              to="/User/VideoCall"
            >
              <span className={styles.label}>Video llamada</span>
              <FontAwesomeIcon icon={faVideo} />
            </NavLink>
            <div className={styles.nav__item}>
              <span className={styles.label}>
                <input
                  className={styles.search__input}
                  type="text"
                  placeholder="Busqueda"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  />
                </span>
                <NavLink to="/User/Search" className={({ isActive }) =>
                  `${isActive ? styles.active : ''} ${styles.iconsearch}`
                }>
                <FontAwesomeIcon icon={faSearch} />
              </NavLink>
            </div>
          </ul>
        )}
        {!isVisible && (
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
              <span className={styles.label}>Probar Codigo</span>
              <FontAwesomeIcon icon={faFileCode} />
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `${isActive && styles.active} ${styles.nav__item}`
              }
              to="/User/VideoCall"
            >
              <span className={styles.label}>Video llamada</span>
              <FontAwesomeIcon icon={faVideo} />
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `${isActive && styles.active} ${styles.nav__item}`
              }
              to="/User/Search"
            >
              <span className={styles.label}>
                <input
                  className={styles.search__input}
                  type="text"
                  placeholder="Busqueda"
                  value={searchTerm} 
                  onChange={handleSearchInputChange}
                />
              </span>
              <FontAwesomeIcon icon={faSearch} />
            </NavLink>
        </ul>
        )}
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