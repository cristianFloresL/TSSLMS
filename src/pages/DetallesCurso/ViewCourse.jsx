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
  CircularProgress
} from '@mui/material';
import ReactPlayer from 'react-player';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const ViewCourse = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState({});
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [openModules, setOpenModules] = useState([false, false, false, false]); // Ocultar los módulos por defecto
  const [loading, setLoading] = useState(true); // Estado de carga
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchCourse = async () => {
      const courseRef = doc(firestore, 'clases', courseId);
      const courseSnapshot = await getDoc(courseRef);

      if (courseSnapshot.exists()) {
        setCourse(courseSnapshot.data());
      } else {
        console.error('No such course!');
      }
    };

    const fetchModules = async () => {
      const updatedModules = [];
      for (let i = 0; i < 4; i++) {
        const moduleRef = collection(firestore, `clases/${courseId}/modulo${i + 1}`);
        const moduleSnapshot = await getDocs(moduleRef);
        const moduleData = [];

        for (const doc of moduleSnapshot.docs) {
          if (doc.id !== 'quiz') {
            const data = doc.data();
            moduleData.push({ id: doc.id, ...data });
          }
        }

        const quizRef = doc(moduleRef, 'quiz');
        const quizSnapshot = await getDoc(quizRef);
        const quizData = quizSnapshot.exists() ? quizSnapshot.data() : null;

        updatedModules.push({ resources: moduleData, quiz: quizData });
      }

      setModules(updatedModules);
      setLoading(false); // Finalizar la carga
    };

    fetchCourse();
    fetchModules();
  }, [courseId]);

  const handleModuleClick = (index) => {
    const updatedOpenModules = [...openModules];
    updatedOpenModules[index] = !updatedOpenModules[index];
    setOpenModules(updatedOpenModules);
    // Eliminar la selección del módulo para que no afecte la visualización del recurso seleccionado
    if (selectedModule === index) {
      setSelectedModule(null);
    }
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
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
            position: 'relative', 
            zIndex: '2',
          },
        }}
      >
        <List>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '50px'}}>
              <CircularProgress />
            </Box>
          ) : (
            modules.map((module, index) => (
              <div key={index}>
                <ListItem button onClick={() => handleModuleClick(index)}>
                  <ListItemIcon >
                    <MenuBookIcon sx={{ fontSize: '2rem' }} />
                  </ListItemIcon>
                  <ListItemText primary={`Módulo ${index + 1}`} />
                </ListItem>
                <Divider />
                <Collapse in={openModules[index]}>
                  {module.resources.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No hay recursos en este módulo" />
                    </ListItem>
                  ) : (
                    module.resources.sort((a, b) => a.position - b.position).map((resource) => (
                      <ListItem
                        button
                        key={resource.id}
                        onClick={() => handleResourceClick(resource)}
                        selected={selectedResource?.id === resource.id}
                      >
                        <ListItemIcon
                          sx={{
                            color: resource.type === 'video' ? '#4B0082' : 'red', // Morado más azulado y oscuro para video
                            fontSize: resource.type === 'module' ? '1.3rem' : 'inherit' // Tamaño normal para íconos de recursos
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
                    ))
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
                  {course.courseName}
                </Typography>
              </Box>
            )}
          </Grid>
          {selectedResource && (
            <Grid item xs={12}>
              <Typography variant="h5">{selectedResource.title}</Typography>
              {selectedResource.type === 'video' ? (
                <ReactPlayer url={selectedResource.url} controls width="100%" />
              ) : (
                <Box
                  sx={{
                    height: '70vh',
                  }}
                >
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
    </Box>
  );
};

export default ViewCourse;
