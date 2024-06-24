import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../connection/firebaseConfig';
import {
  Typography,
  Grid,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Collapse,
  CircularProgress,
  IconButton
} from '@mui/material';
import { FaChartBar } from 'react-icons/fa';
import ReactPlayer from 'react-player';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LCGMomponent from '../Generadores/GeneradorCM';
import LCGComponent from '../Generadores/GeneradorCL';
import CompositionSamplingComponent from '../Generadores/GeneradorComposicion';
import RejectionSamplingComponent from '../Generadores/GeneradorRechazo';
import InverseTransformComponent from '../Generadores/GeneradorTransInversa';

const ViewCourse = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState({});
  const [themes, setThemes] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [openThemes, setOpenThemes] = useState([false, false, false, false, false]); // Ocultar los temas por defecto
  const [loading, setLoading] = useState(true); // Estado de carga
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(window.scrollY);
      setSidebarOpen(false);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      const courseRef = doc(firestore, 'groups', courseId);
      const courseSnapshot = await getDoc(courseRef);

      if (courseSnapshot.exists()) {
        setCourse(courseSnapshot.data());
      } else {
        console.error('No such course!');
      }
    };

    const fetchThemes = async () => {
      const simulr = "PmsGWJ2NCt9yb8OenzBu";
      const updatedThemes = [];
      for (let i = 0; i < 5; i++) {
        const themeRef = collection(firestore, `clases/${simulr}/tema${i + 1}`);
        const themeSnapshot = await getDocs(themeRef);
        const themeData = [];

        for (const doc of themeSnapshot.docs) {
          const data = doc.data();
          themeData.push({ id: doc.id, ...data });
        }

        updatedThemes.push({ resources: themeData });
      }

      setThemes(updatedThemes);
      setLoading(false); // Finalizar la carga
    };

    fetchCourse();
    fetchThemes();
  }, [courseId]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 550) {
        setSidebarOpen(false);
        setIsVisible(true);
      } else {
        setSidebarOpen(true);
        setIsVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);  

  const handleThemeClick = (index) => {
    const updatedOpenThemes = openThemes.map((open, i) => i === index ? !open : false);
    setOpenThemes(updatedOpenThemes);
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            height: 'calc(100vh - 100px)',
            position: "relative",
            zIndex: '222',
            display: { xs: sidebarOpen ? 'block' : 'none', sm: 'block' },
          },
          position: { xs: isVisible ? 'fixed' : '' },
          zIndex: '222',
        }}
      >
        <List>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '50px'}}>
              <CircularProgress />
            </Box>
          ) : (
            themes.map((theme, index) => (
              <div key={index}>
                <ListItem button onClick={() => handleThemeClick(index)}>
                  <ListItemIcon>
                    <MenuBookIcon sx={{ fontSize: '2rem' }} />
                  </ListItemIcon>
                  <ListItemText primary={`Tema ${index + 1}`} />
                </ListItem>
                <Divider />
                <Collapse in={openThemes[index]}>
                  {theme.resources.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No hay recursos en este tema" />
                    </ListItem>
                  ) : (
                    <>
                      {theme.resources.map((resource) => (
                        <ListItem
                          button
                          key={resource.id}
                          onClick={() => handleResourceClick(resource)}
                          selected={selectedResource?.id === resource.id}
                        >
                          <ListItemIcon
                            sx={{
                              color: resource.type === 'video' ? '#4B0082' : 'red',
                              fontSize: resource.type === 'module' ? '1.3rem' : 'inherit'
                            }}
                          >
                            {resource.type === 'video' ? (
                              <VideoLibraryIcon />
                            ) : (
                              <PictureAsPdfIcon />
                            )}
                          </ListItemIcon>
                          <ListItemText primary={resource.title} />
                        </ListItem>
                      ))}
                      {index === 1 && (
                        <>
                          <ListItem button onClick={() => handleResourceClick({ id: 'comp1', type: 'component', title: 'Generador Congruencial Lineal' })}>
                            <ListItemIcon>
                              <FaChartBar style={{ color: 'green', fontSize: '21px' }} />
                            </ListItemIcon>
                            <ListItemText primary="Generador Congruencial Lineal" />
                          </ListItem>
                          <ListItem button onClick={() => handleResourceClick({ id: 'comp2', type: 'component', title: 'Generador Congruencial Multiplicativo' })}>
                            <ListItemIcon>
                              <FaChartBar style={{ color: 'green', fontSize: '21px' }} />
                            </ListItemIcon>
                            <ListItemText primary="Generador Congruencial Multiplicativo" />
                          </ListItem>
                        </>
                      )}
                      {index === 3 && (
                        <>
                          <ListItem button onClick={() => handleResourceClick({ id: 'comp3', type: 'component', title: 'Transformada Inversa' })}>
                            <ListItemIcon>
                              <FaChartBar style={{ color: 'green', fontSize: '21px' }} />
                            </ListItemIcon>
                            <ListItemText primary="Transformada Inversa" />
                          </ListItem>
                          <ListItem button onClick={() => handleResourceClick({ id: 'comp4', type: 'component', title: 'Método del Rechazo' })}>
                            <ListItemIcon>
                              <FaChartBar style={{ color: 'green', fontSize: '21px' }} />
                            </ListItemIcon>
                            <ListItemText primary="Método del Rechazo" />
                          </ListItem>
                          <ListItem button onClick={() => handleResourceClick({ id: 'comp5', type: 'component', title: 'Método de Composición' })}>
                            <ListItemIcon>
                              <FaChartBar style={{ color: 'green', fontSize: '21px' }} />
                            </ListItemIcon>
                            <ListItemText primary="Método de Composición" />
                          </ListItem>
                        </>
                      )}
                    </>
                  )}
                </Collapse>
              </div>
            ))
          )}
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{ position: 'relative', marginBottom: '20px' }}>
            {course.imageUrl && (
              <Box
                component="div"
                sx={{
                  position: 'relative',
                  height: '200px',
                  backgroundImage: `url(${course.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '10px',
                  boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.6)',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                  }}
                >
                  {course.groupName}
                </Typography>
              </Box>
            )}
          </Grid>
          {selectedResource && (
            <Grid item xs={12}>
              <Typography variant="h5">{selectedResource.title}</Typography>
              {selectedResource.type === 'video' ? (
                <ReactPlayer url={selectedResource.url} controls width="100%" />
              ) : selectedResource.type === 'component' ? (
                selectedResource.id === 'comp1' ? <LCGComponent  /> :
                selectedResource.id === 'comp2' ? <LCGMomponent /> :
                selectedResource.id === 'comp3' ? <InverseTransformComponent/> :
                selectedResource.id === 'comp4' ? <RejectionSamplingComponent /> :
                selectedResource.id === 'comp5' ? <CompositionSamplingComponent /> :
                null
              ) : (
                <Box sx={{ height: '70vh' }}>
                  <Typography variant="body1">{selectedResource.description}</Typography>
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <Viewer fileUrl={selectedResource.url} plugins={[defaultLayoutPluginInstance]} />
                  </Worker>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </Box>
      {isVisible && (
        <button
          className='botonrepon'
          onClick={toggleSidebar}
          style={{left: sidebarOpen ? '248px' : '25px'}}
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      )}
    </Box>
  );
};

export default ViewCourse;
