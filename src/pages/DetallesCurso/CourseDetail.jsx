import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../connection/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';
import { UserContext } from '../../context/UserContext';
import { Container, Typography, Button, CardMedia, Snackbar, Alert, Box, Chip } from '@mui/material';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchCourse = async () => {
      const courseDoc = doc(firestore, 'clases', courseId);
      const courseSnapshot = await getDoc(courseDoc);
      if (courseSnapshot.exists()) {
        setCourse(courseSnapshot.data());
      } else {
        console.error('No se encontró el curso');
      }
    };

    const checkSubscription = async () => {
      if (currentUser && currentUser !== 'invitado') {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.courses && userData.courses.some(course => course.courseId === courseId)) {
            setIsSubscribed(true);
          }
        }
      }
    };

    fetchCourse();
    checkSubscription();
  }, [courseId, currentUser]);

  const handleSubscribe = async () => {
    if (!currentUser || currentUser === 'invitado') {
      setSnackbar({ open: true, message: 'Debes iniciar sesión para suscribirte a un curso', severity: 'warning' });
      return;
    }

    const userRef = doc(firestore, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        courses: arrayUnion({ courseId, progress: 0 })
      });
      setIsSubscribed(true);
      setSnackbar({ open: true, message: 'Te has suscrito al curso exitosamente', severity: 'success' });
    } catch (error) {
      console.error("Error al suscribirse al curso: ", error);
      setSnackbar({ open: true, message: 'Hubo un error al suscribirse al curso', severity: 'error' });
    }
  };

  const handleUnsubscribe = async () => {
    const userRef = doc(firestore, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        courses: arrayRemove({ courseId, progress: 0 })
      });

      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (!userData.courses || userData.courses.length === 0) {
          await updateDoc(userRef, {
            courses: deleteField()
          });
        }
      }

      setIsSubscribed(false);
      setSnackbar({ open: true, message: 'Se anuló la suscripción al curso', severity: 'error' });
    } catch (error) {
      console.error("Error al anular la suscripción al curso: ", error);
      setSnackbar({ open: true, message: 'Hubo un error al anular la suscripción al curso', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  if (!course) {
    return <p>Cargando...</p>;
  }

  return (
    <Container>
      <CardMedia
        component="img"
        image={course.imageUrl || 'default-image-url'}
        alt={course.courseName}
        style={{ height: '300px', marginBottom: '1rem' }}
      />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h3" gutterBottom style={{ color: '#1f2029', fontWeight: 'bold' }}>
          {course.courseName}
        </Typography>
        <Chip
          label={`Nivel: ${course.englishLevel}`}
          color="primary"
          variant="outlined"
          sx={{ marginLeft: '1rem', marginBottom: '1.5rem' }}
        />
      </Box>
      <Box 
        component="div"
        sx={{ 
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'left',
          backgroundColor: '#f9f9f9'
        }}
      >
        <Typography variant="h6" gutterBottom>{course.courseDescription}</Typography>
      </Box>
      {isSubscribed ? (
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#f44336', 
            color: '#fff', 
            '&:hover': {
              backgroundColor: '#d32f2f' // Red más oscuro para el hover
            }
          }} 
          onClick={handleUnsubscribe}
        >
          Anular Suscripción
        </Button>
      ) : (
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#102770', 
            color: '#fff',
            '&:hover': {
              backgroundColor: '#0d1f4d' // Azul más oscuro para el hover
            }
          }} 
          onClick={handleSubscribe}
        >
          Suscribirse al curso
        </Button>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%', backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336', color: '#fff' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseDetail;
