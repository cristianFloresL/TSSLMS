import React, { createContext, useState, useEffect } from 'react';
import { SHA256 } from 'crypto-js';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleC, setRoleC] = useState(null);
  
  const encriptarDatos = (datos) => {
    const jsonDatos = JSON.stringify(datos);
    return SHA256(jsonDatos).toString();
  };

  useEffect(() => {
    if (currentUser === null || roleC === null) {
      setLoading(true); 
      const userDataJSON = localStorage.getItem('userData');
      const userDataEncrip = localStorage.getItem('userDataEncriptado')
      const datosEncriptados = encriptarDatos(userDataJSON);
      if (userDataJSON) {
        if (userDataEncrip === datosEncriptados){
          const userData = JSON.parse(userDataJSON);
          setCurrentUser(userData);
          setRoleC(userData.role);
          setLoading(false); 
        } else {
          localStorage.removeItem('userData');
          localStorage.removeItem('userDataEncriptado');
        }
      } else {
        setRoleC('invitado');
        setCurrentUser('invitado');
        setLoading(false); 
      }
    }
  }, [currentUser, roleC]); 
  

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading, roleC, setRoleC}}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };