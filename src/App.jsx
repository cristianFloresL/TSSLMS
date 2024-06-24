import React, { useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import LoginForm from './pages/login/LoginForm';
import Landing from './pages/landingpage/Landing';
import CoursesList from './pages/welcome/CoursesList';
import Navbar from './pages/Navbar/Navbar';
import PasswordResetForm from './pages/login/PasswordResetForm';
import Sidebar from './pages/Sidebar/Sidebar';
import EnglishCourseForm from './pages/ClassForm/EnglishCourseForm';
import CourseList from './pages/CourseList/CourseList';
import EditCourse from './pages/ClassResources/EditCourse';
import CourseDetail from './pages/DetallesCurso/CourseDetail';
import SubscribedCourses from './pages/MisCursos/SubscribedCourses';
import ViewCourse from './pages/DetallesCurso/ViewCourse';
import ProvarCodigo from './pages/PruevaDeCodigoPlano/Pruevadecodigo';
import SearchResults from './pages/busqueda/SearchResults';
import VideoCall from './pages/videocall/VideoCall';

function PrivateAdminRoute({ element }) {
  const { roleC } = useContext(UserContext);

  return roleC === 'admin' ? element : <Navigate to="/" replace />;
}

function PrivateUserRoute({ element }) {
  const { roleC } = useContext(UserContext);

  return roleC === 'usuario' ? element : <Navigate to="/" replace />;
}

function PrivateGestRoute({ element }) {
  const { roleC } = useContext(UserContext);
  console.log (roleC);
  return roleC === 'invitado' ? element : <Navigate to="/" replace/>;
}

function AdminRoutes() {
  return (
    <div>
      <Sidebar />
      <Routes>
        <Route path='/crear-curso' element={<EnglishCourseForm />}/>
        <Route path='/recursos-curso' element={<CourseList />}/>
        <Route path='/edit-course/:courseId' element={<EditCourse />}/>
      </Routes>
    </div>
  );
}

function UserRoutes() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path='/Search' element={<SearchResults/>}/>
        <Route path='/MyCourses' element={<SubscribedCourses />}/>
        <Route path="/viewcourse/:courseId" element={<ViewCourse />} />        
        <Route path="/PrueCod" element={<ProvarCodigo />}/>
        <Route path="/VideoCall" element={<VideoCall />}/>
      </Routes>
    </div>
  );
}

function GestRoutes() {
  return (
    <div>
      <Routes>
        <Route path='/Login' element={<LoginForm />}/>
        <Route path='/Recuperar' element={<PasswordResetForm />}/>
      </Routes>
    </div>
  );
}
  
function getHomeElement(roleC) {
  switch (roleC) {
    case 'admin':
      return (
        <div>
          <Sidebar />
          <h1>Admin</h1>
        </div>
      );
    case 'usuario':
      return (
        <div>
          <Navbar />  
          <CoursesList />
        </div>
      );
    case 'invitado':
      return <Landing />;
    default:
      return <Navigate to="/" replace />;
  }
}

function App() {
  const { loading, roleC } = useContext(UserContext);
  return (
    <Router>
    {loading ? (
          <div>Loading...</div>
        ) : (
      <Routes>
          <Route path='/' element={getHomeElement(roleC)} />
          <Route path="/Admin/*" element={<PrivateAdminRoute element={<AdminRoutes />} />} />
          <Route path="/User/*" element={<PrivateUserRoute element={<UserRoutes />} />} />
          <Route path='/Gest/*' element={<PrivateGestRoute element={<GestRoutes />} />} />
      </Routes>
    )}
  </Router>
  );
}

export default App;