import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';
import { firestore, storage } from '../../connection/firebaseConfig';
import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress } from '@mui/material';
import { Visibility } from '@mui/icons-material';

const TaskDetails = () => {
  const { groupId, taskId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para controlar la carga
  let num = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const submissionsData = await getSubmissionsData();
        setLoading(false); // Cambiar a false cuando los datos se carguen
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setLoading(false); // Cambiar a false en caso de error también
      }
    };

    fetchData();
  }, [groupId, taskId]);

  const getSubmissionsData = async () => {
    try {
      const usua = [];
      setSubmissions([]);
      // Obtener la lista de carpetas en storage
      const listRef = ref(storage, `groups/${groupId}/tasks/${taskId}`);
      const res = await listAll(listRef);
      const nu = res.prefixes.length;
      // Array para almacenar todas las promesas de obtención de datos
      const promises = [];

      // Iterar sobre las carpetas
      res.prefixes.forEach((prefix) => {
        const los = prefix._location.path_.replace(`groups/${groupId}/tasks/${taskId}/`, "");

        // Consultar Firestore para obtener detalles del usuario
        const queryPromise = getDocs(collection(firestore, 'users')).then(querySnapshot => {
          querySnapshot.forEach(async (doc) => {
            if (los === doc.id) {
              console.log(querySnapshot);
              const listRef = ref(storage, `groups/${groupId}/tasks/${taskId}/${los}`);
              const res = await listAll(listRef);
              const ids = doc.id;
              const nombre = doc.data().username;
              const dou = await getDownloadURL(res.items[0]);
              const existeObjeto = usua.some(objeto => objeto[2] === dou);
              
              if (num<=nu) {
                setSubmissions(prevSubmissions => [...prevSubmissions, [ids, nombre, dou]]);
                num=num+1;
              }
              usua.push([ids, nombre, dou]);
              
              //await setSubmissions(usua);
              console.log(submissions);

            }
          });
        });

        promises.push(queryPromise);
        
      });

      // Esperar a que todas las consultas asíncronas se completen
      await Promise.all(promises);
      console.log(promises);
      return usua;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return []; // Retornar un array vacío en caso de error
    }
  };

  // Si está cargando, mostrar un círculo de carga
  if (loading) {
    return (
      <div className='list-container'>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </div>
    );
  }

  // Cuando haya terminado de cargar, mostrar la tabla de entregas
  return (
    <div className='list-container'>
      <Container>
        <Box sx={{ borderRadius: 2, boxShadow: 3, padding: 3, backgroundColor: 'white', marginTop: '100px', marginBottom: '100px' }}>
          <Typography variant="h4" gutterBottom>
            Entregas
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Estudiante ID</TableCell>
                  <TableCell>Link de Entrega</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No hay entregas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission, index) => (
                    <TableRow key={index}>
                      <TableCell>{submission[1]}</TableCell>
                      <TableCell>
                        <a href={submission[2]} target="_blank" rel="noopener noreferrer">Ver Entrega</a>
                      </TableCell>
                      <TableCell>
                        <IconButton color="primary">
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </div>
  );
};

export default TaskDetails;
