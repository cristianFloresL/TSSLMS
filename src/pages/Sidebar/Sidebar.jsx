import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css'; 
import { FiLogOut } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import { FaBars, FaTimes, FaComments, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from '../../connection/firebaseConfig';

const Sidebar = () => {
  const {setCurrentUser, setRoleC, currentUser} = useContext(UserContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mensajesRef.current && !mensajesRef.current.contains(event.target)) {
        setShowMensajes(false);
      }
    };
    document.body.addEventListener('click', handleClickOutside);
    return () => {
      document.body.removeEventListener('click', handleClickOutside);};
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setSidebarOpen(false);
  }
  const handleOpen = () => {
    setSidebarOpen(true);
    setIsVisible(true);
  }

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
    <div>
    <div className='mensajescontainerad' ref={mensajesRef}>
      <button className={`bellicoso ${showMensajes ? 'active' : ''}`} onClick={toggleMensajes}>
        <FaComments />
      </button>
      {showMensajes && (
        <div className='mensajesmenu'>
          {selectedContact ? (
            <div>
              <div className='chatheader'>
                <button className='backbutton' onClick={handleBackClick}>
                  <FaArrowLeft />
                </button>
                <h3>{selectedContact.username}</h3>
              </div>
              <div className='chatcontainer'>
                <div className='messageslist' ref={messagesListRef}>
                  {messages.map((mensaje) => (
                    <div key={mensaje.id} className={`message ${mensaje.senderEmail === currentUser.email ? 'sent' : 'received'}`}>
                      <p>{mensaje.contenido}</p>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form className='messageform' onSubmit={handleMensajeSubmit}>
                  <input
                    type='text'
                    className='messageinput'
                    placeholder='Escribe un mensaje'
                    value={mensajeInput}
                    onChange={(e) => setMensajeInput(e.target.value)}
                  />
                  <button type='submit' className='messagesubmit'>
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <div className='mensajestabs'>
                <button onClick={() => setActiveTab('mensajes')} className={activeTab === 'mensajes' ? 'mensajeactive' : ''}>Mensajes</button>
                <button onClick={() => setActiveTab('usuarios')} className={activeTab === 'usuarios' ? 'mensajeactive' : ''}>Usuarios</button>
                <button onClick={() => setActiveTab('admin')} className={activeTab === 'admin' ? 'mensajeactive' : ''}>Admin</button>
              </div>
              <div className='mensajescontent'>
                <div className='mensajessection' style={{ display: activeTab === 'mensajes' ? 'block' : 'none' }}>
                  <h2>Mensajes</h2>
                  {conversationContacts.length === 0 ? (
                    <p>No hay conversaciones abiertas.</p>
                  ) : (
                    conversationContacts.map((contact) => (
                      <div key={contact.email} className='contactitem' onClick={() => handleContactClick(contact)}>
                        <p>{contact.username}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className='contactssection' style={{ display: activeTab === 'usuarios' || activeTab === 'admin' ? 'block' : 'none' }}>
                  <h2>{activeTab === 'usuarios' ? 'Usuarios' : 'Admin'}</h2>
                  {contacts.filter((contact) => contact.role === (activeTab === 'usuarios' ? 'usuario' : 'admin')).map((contact) => (
                    <div key={contact.email} className='contactitem' onClick={() => handleContactClick(contact)}>
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