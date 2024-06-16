import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { firestore, storage } from '../../connection/firebaseConfig';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Container, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(firestore, "clases"));
      const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
    };

    fetchCourses();
  }, []);

  const deleteFolderContents = async (folderRef) => {
    const listResponse = await listAll(folderRef);
    const deletePromises = listResponse.items.map((itemRef) => deleteObject(itemRef));

    const subfolderPromises = listResponse.prefixes.map((subfolderRef) => deleteFolderContents(subfolderRef));
    await Promise.all([...deletePromises, ...subfolderPromises]);
  };

  const deleteCourseWithSubcollections = async (courseId) => {
    try {
      const courseDocRef = doc(firestore, "clases", courseId);
      const courseDocSnapshot = await getDoc(courseDocRef);

      if (!courseDocSnapshot.exists()) {
        console.error("El documento no existe");
        return false;
      }
      const courseData = courseDocSnapshot.data();
      const subcollections = courseData.subcollections || [];

      for (const subcollectionId of subcollections) {
        const subcollectionRef = collection(courseDocRef, subcollectionId);
        const subcollectionDocsSnapshot = await getDocs(subcollectionRef);

        for (const subcollectionDoc of subcollectionDocsSnapshot.docs) {
          await deleteDoc(subcollectionDoc.ref);
        }
      }
      await deleteDoc(courseDocRef);
      return true;
    } catch (error) {
      console.error("Error eliminando el curso y sus subcolecciones: ", error);
      return false;
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      try {
        const deleteSuccess = await deleteCourseWithSubcollections(courseId);
        if (deleteSuccess) {
          const courseStorageRef = ref(storage, `courses/${courseId}`);
          await deleteFolderContents(courseStorageRef);
          setCourses(courses.filter(course => course.id !== courseId));
          alert('Curso eliminado exitosamente');
        } else {
          alert('Hubo un error eliminando el curso y sus subcolecciones');
        }
      } catch (error) {
        console.error("Error eliminando el curso: ", error);
        alert('Hubo un error eliminando el curso');
      }
    }
  };

  const handleEdit = (courseId) => {
    navigate(`/Admin/edit-course/${courseId}`);
  };

  const truncateDescription = (description, length) => {
    if (description.length > length) {
      return description.substring(0, length) + '...';
    }
    return description;
  };

  return (
    <div className='list-container'>
      <Container>
        <Box
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            padding: 3,
            backgroundColor: 'white',
            marginTop: '100px',
            marginBottom: '100px',
          }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre del Curso</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Nivel de Inglés</TableCell>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell>{truncateDescription(course.courseDescription, 10)}</TableCell>
                    <TableCell>{course.englishLevel}</TableCell>
                    <TableCell>
                      {course.imageUrl && <img src={course.imageUrl} alt={course.courseName} width="100" style={{ borderRadius: '10px' }}/>}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(course.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDelete(course.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </div>
  );
};

export default CourseList;