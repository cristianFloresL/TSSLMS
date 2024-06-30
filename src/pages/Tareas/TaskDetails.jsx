import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../connection/firebaseConfig';
import { 
  Box, 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  CircularProgress,
  Modal,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const TaskDetails = () => {
  const { groupId, taskId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openGradeModal, setOpenGradeModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const submissionsData = await getSubmissionsData();
        setSubmissions(submissionsData);
        setFilteredSubmissions(submissionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, taskId]);

  const getSubmissionsData = async () => {
    try {
      const submissions = [];
      const submissionsCollectionRef = collection(firestore, 'groups', groupId, 'tasks', taskId, 'submissions');
      const submissionsSnapshot = await getDocs(submissionsCollectionRef);

      for (const submissionDoc of submissionsSnapshot.docs) {
        const submissionData = submissionDoc.data();
        submissions.push({
          userId: submissionDoc.id,
          fileUrl: submissionData.fileUrl,
          submittedAt: submissionData.timestamp.toDate().toLocaleString(),
          grade: submissionData.grade
        });
      }

      return submissions;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  };

  const handleOpenGradeModal = (submission) => {
    setCurrentSubmission(submission);
    setGrade(submission.grade === 'none' ? '' : submission.grade);
    setOpenGradeModal(true);
  };

  const handleCloseGradeModal = () => {
    setOpenGradeModal(false);
    setCurrentSubmission(null);
    setGrade('');
  };

  const handleUpdateGrade = async () => {
    if (currentSubmission) {
      const submissionDocRef = doc(firestore, 'groups', groupId, 'tasks', taskId, 'submissions', currentSubmission.userId);
      await updateDoc(submissionDocRef, { grade: grade });
      setSubmissions(submissions.map(sub => sub.userId === currentSubmission.userId ? { ...sub, grade: grade } : sub));
      setFilteredSubmissions(submissions.map(sub => sub.userId === currentSubmission.userId ? { ...sub, grade: grade } : sub));
      handleCloseGradeModal();
    }
  };

  const handleSetNotGraded = async () => {
    if (currentSubmission) {
      const submissionDocRef = doc(firestore, 'groups', groupId, 'tasks', taskId, 'submissions', currentSubmission.userId);
      await updateDoc(submissionDocRef, { grade: 'none' });
      setSubmissions(submissions.map(sub => sub.userId === currentSubmission.userId ? { ...sub, grade: 'none' } : sub));
      setFilteredSubmissions(submissions.map(sub => sub.userId === currentSubmission.userId ? { ...sub, grade: 'none' } : sub));
      handleCloseGradeModal();
    }
  };

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilter(value);
    if (value === 'graded') {
      setFilteredSubmissions(submissions.filter(submission => submission.grade !== 'none'));
    } else if (value === 'not_graded') {
      setFilteredSubmissions(submissions.filter(submission => submission.grade === 'none'));
    } else {
      setFilteredSubmissions(submissions);
    }
  };

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

  return (
    <div className='list-container'>
      <Container>
        <Box sx={{ borderRadius: 2, boxShadow: 3, padding: 3, backgroundColor: 'white', marginTop: '100px', marginBottom: '100px' }}>
          <Typography variant="h4" gutterBottom>
            Entregas
          </Typography>
          <FormControl sx={{ marginBottom: 2, minWidth: 120 }}>
            <InputLabel>Filtros</InputLabel>
            <div style={{marginBottom: '5px'}}></div>
            <Select value={filter} onChange={handleFilterChange}>
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="graded">Calificadas</MenuItem>
              <MenuItem value="not_graded">No Calificadas</MenuItem>
            </Select>
          </FormControl>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>UID Estudiante</TableCell>
                  <TableCell>Fecha de Entrega</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Link de Entrega</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay entregas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission, index) => (
                    <TableRow key={index}>
                      <TableCell>{submission.userId}</TableCell>
                      <TableCell>{submission.submittedAt}</TableCell>
                      <TableCell>
                        {submission.grade === 'none' ? '?' : <span style={{ color: 'green' }}>✔</span>}
                      </TableCell>
                      <TableCell>
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">Ver Entrega</a>
                      </TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleOpenGradeModal(submission)}>
                          <AssignmentTurnedInIcon />
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

      <Modal
        open={openGradeModal}
        onClose={handleCloseGradeModal}
        aria-labelledby="grade-modal-title"
        aria-describedby="grade-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" id="grade-modal-title">
            Calificar Entrega
          </Typography>
          <TextField
            label="Calificación /100"
            variant="outlined"
            fullWidth
            value={grade}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value) && (value === '' || (Number(value) >= 1 && Number(value) <= 100))) {
                setGrade(value);
              }
            }}
            sx={{ marginBottom: 2 }}
            inputProps={{ maxLength: 3 }}
          />
          <Button variant="contained" color="primary" onClick={handleUpdateGrade} sx={{ marginRight: 2 }}>
            Guardar
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleSetNotGraded}>
            No Calificado
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default TaskDetails;
