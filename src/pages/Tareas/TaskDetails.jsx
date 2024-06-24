import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../connection/firebaseConfig';
import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Visibility } from '@mui/icons-material';

const TaskDetails = () => {
  const { groupId, taskId } = useParams();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const submissionsCollection = collection(firestore, 'groups', groupId, 'tasks', taskId, 'submissions');
      const submissionsSnapshot = await getDocs(submissionsCollection);
      const submissionsData = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(submissionsData);
    };

    fetchSubmissions();
  }, [groupId, taskId]);

  return (
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
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.userId}</TableCell>
                  <TableCell><a href={submission.link} target="_blank" rel="noopener noreferrer">View Submission</a></TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => {/* Add functionality to grade */}}>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default TaskDetails;
