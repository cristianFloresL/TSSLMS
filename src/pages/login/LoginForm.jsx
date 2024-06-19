import React, { useState, useContext } from 'react';
import "./LoginForm.css"
import { FaAt, FaLock, FaUser, FaEye, FaEyeSlash} from 'react-icons/fa';
import { Link,  useNavigate } from 'react-router-dom';
import logo from "../../assets/ELEVA.png";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc} from "firebase/firestore";
import { auth, firestore } from '../../connection/firebaseConfig';
import { UserContext } from '../../context/UserContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SHA256 from 'crypto-js/sha256';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setCurrentUser } = useContext(UserContext); 
    const navigate = useNavigate();
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailDuplicateError, setEmailDuplicateError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [logineError, setLogineError] = useState('');
    const [loginpError, setLoginpError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateUsername = (username) => {
        if (!username.trim()) {
            return 'Nombre de usuario es requerido.';
        }    
        if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜ\s]+$/g.test(username)) {
            return 'Nombre de usuario solo puede contener letras, números y espacios.';
        }    
        if (username.length > 50) {
            return 'Nombre de usuario debe tener máximo 50 caracteres.';
        }
        if (!/^[a-zA-Z0-9]/.test(username)) {
            return 'El nombre de usuario no puede comenzar con un espacio en blanco.';
        }    
        return '';
    };
    
    const validateEmail = (email) => {
        if (!email) {
            return 'Correo electrónico es requerido.';
        }
        if (/\s/.test(email)) {
            return 'El correo no puede contener espacios en blanco.';
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return 'Correo electrónico no es válido.';
        }
        return '';
    };
    
    const validatePassword = (password) => {
        if (!password.trim()) {
            return 'Contraseña es requerida.';
        }    
        if (password.length < 8) {
            return 'Contraseña debe tener al menos 8 caracteres.';
        }    
        if (!/^[a-zA-Z0-9]+$/.test(password)) {
            return 'Contraseña solo puede contener letras y números.';
        }   
        return '';
    };
    
    const encriptarDatos = (datos) => {
        const jsonDatos = JSON.stringify(datos);
        return SHA256(jsonDatos).toString();
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        setUsernameError('');
    };
    
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError('');
        setEmailDuplicateError('');
        setLogineError('');
    };
    
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError('');
        setLoginpError('');
    };

    const handleRegister = async () => {
        setIsRegistering(true);
        const usernameError = validateUsername(username);
        if (usernameError) {
            setUsernameError(usernameError);
            setIsRegistering(false);
            return;
        } else {
            setUsernameError('');
        }

        const emailError = validateEmail(email);
        if (emailError) {
            setEmailError(emailError);
            setIsRegistering(false);
            return;
        } else {
            setEmailError('');
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setPasswordError(passwordError);
            setIsRegistering(false);
            return;
        } else {
            setPasswordError('');
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Guardar el nombre de usuario en la base de datos
            await setDoc(doc(firestore, 'users', user.uid), {
                username: username,
                email: email,
                role: 'usuario',
            });
            
            console.log('Usuario registrado:', user);
            setOpenSnackbar(true);
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            if (error.code === 'auth/email-already-in-use') {
                setEmailDuplicateError('El correo electrónico ya está registrado.');
                setIsRegistering(false);
            } else if (error.code === 'auth/weak-password') {
                alert('¡La contraseña es débil!');
            } else {
                alert('¡Ocurrió un error al registrar el usuario!');
            }
        }
        setIsRegistering(false);
    };
    
    const handleLogin = async () => {
        setIsRegistering(true); 
        if (!email.trim()) {
            setLogineError('Correo electrónico es requerido.');
            setIsRegistering(false);
            return;
        }else{
            setLogineError('');
        }
        if (!password.trim()){
            setLoginpError('Contraseña es requerida.');
            setIsRegistering(false);
            return;
        }else{
            setLoginpError('');
        }
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const uid = user.uid;
            const userDoc = doc(firestore, 'users', uid);
            const userSnapshot = await getDoc(userDoc);
            const username = userSnapshot.get('username');
            const role = userSnapshot.get('role');
            const userData = {
                uid: uid,
                username: username,
                role: role,
                email: user.email,
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            const ud = localStorage.getItem('userData');
            const datosEncriptados = encriptarDatos(ud);
            localStorage.setItem('userDataEncriptado', datosEncriptados);
            setCurrentUser(null);
            navigate('/');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            // Maneja otros errores de inicio de sesión
            if (error.code === 'auth/invalid-email') {
                setLogineError('Correo electrónico incorrecto.');
            } else if (error.code === 'auth/invalid-credential') {
                setLoginpError('Contraseña incorrecta.');
            } else {
                setLoginpError('Ocurrió un error al iniciar sesión.');
            }
        }
        setIsRegistering(false);
    };

    return (
    <div className='contenidolog'>
        <Link to="/" className="logo"> 
            <img src={logo} alt="" /> 
        </Link>
        <div className="sectione mb-4 pb-3">                
            <h6 className="mb-0 pb-3">
                <span className="option">Inicia sesión</span>
                <span> </span>
                <span className="option">Regístrate</span>
            </h6>
            <input className="checkbox" type="checkbox" id="reg-log" name="reg-log" />
            <label htmlFor="reg-log"></label>
                <div className="card-3d-wrap">
                    <div className="card-3d-wrapper">
                        <div className="card-front">
                            <div className="center-wrap">
                                <div className="section text-center">
                                    <h4 className="texto">Inicio sesión</h4>
                                        <div className="form-group">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={handleEmailChange}
                                                name="logemail"
                                                className={`form-style ${logineError ? 'input-error' : ''}`}
                                                placeholder="Tu Correo Institucional"
                                                id="logemail"
                                                autoComplete="off"
                                            />
                                            <FaAt className="input-icon" />
                                            {(logineError) && !loginpError &&<p className="error-text">{logineError}</p>}
                                        </div>
                                        <div className="form-group mt-2">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={handlePasswordChange}
                                                name="logpass"
                                                className={`form-style ${loginpError ? 'input-error' : ''}`}
                                                placeholder="Tu Contraseña"
                                                id="logpass"
                                                autoComplete="off"
                                            />  
                                            <button className="toggle-password" type="button" onClick={togglePasswordVisibility}>
                                                {showPassword ? <FaEyeSlash />: <FaEye /> }
                                            </button>
                                            <FaLock className="input-icon" />
                                            {(loginpError) && !logineError&&<p className="error-text">{loginpError}</p>}
                                            {loginpError && logineError && <p className="error-text">Verifique sus credenciales.</p>}
                                        </div>
                                        <button className="btn mt-4" onClick={handleLogin} disabled={isRegistering}>
                                            {isRegistering ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
                                        </button>
                                    <p className="mb-0 mt-4 text-center"><Link to ="/Gest/Recuperar" className="link">¿Olvidaste tu Contraseña?</Link></p>
                                </div>
                            </div>
                        </div>
                        <div className="card-back">
                            <div className="center-wrap">
                                <div className="section text-center">
                                <h4 className="mb-4 pb-3">Resgristrate</h4>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={handleUsernameChange}
                                            name="logname"
                                            className={`form-style ${usernameError ? 'input-error' : ''}`}
                                            placeholder="Nombre de Usuario"
                                            id="logname"
                                            autoComplete="off"
                                        />
                                        <FaUser className="input-icon" />
                                        {usernameError && !emailError && !passwordError &&<p className="error-text">{usernameError}</p>}
                                    </div>
                                    <div className="form-group mt-2">
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={handleEmailChange}
                                            name="logemail"
                                            className={`form-style ${emailError || emailDuplicateError ? 'input-error' : ''}`}
                                            placeholder="Correo Institucional"
                                            id="logemail1"
                                            autoComplete="off"
                                        />
                                        <FaAt className="input-icon" />
                                        {(emailError || emailDuplicateError) && !usernameError && !passwordError &&
                                        <p className="error-text">{emailError || emailDuplicateError}</p>}
                                    </div>
                                    <div className="form-group mt-2">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            name="logpass"
                                            className={`form-style ${passwordError ? 'input-error' : ''}`}
                                            placeholder="Contraseña"
                                            id="logpass1"
                                            autoComplete="off"
                                        />
                                        <FaLock className="input-icon" />
                                        <button className="toggle-password" type="button" onClick={togglePasswordVisibility}>
                                            {showPassword ? <FaEyeSlash />:<FaEye />}
                                        </button>
                                        {((usernameError&&emailError)||(usernameError&&passwordError)) && <p className="error-text">Verifique sus datos.</p>}
                                        {passwordError && !usernameError && !emailError && <p className="error-text">{passwordError}</p>}
                                    </div>
                                    <button className="btn mt-4" onClick={handleRegister} disabled={isRegistering}>
                                        {isRegistering ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
        <MuiAlert
                elevation={6}
                variant="filled"
                onClose={handleCloseSnackbar}
                severity="success"
            >
                Usuario registrado exitosamente.
            </MuiAlert>
        </Snackbar>
    </div>
    );
}

export default LoginForm;