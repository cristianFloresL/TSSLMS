import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore, storage } from '../../connection/firebaseConfig';
import { Box, Button, Container, Modal, TextField, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Delete, Visibility, Add } from '@mui/icons-material';

const GroupTasksBoard = () => {
  const { groupId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskType, setNewTaskType] = useState('announcement');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollection = collection(firestore, 'groups', groupId, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollection);
      const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
    };

    fetchTasks();
  }, [groupId]);

  const handleAddTask = async () => {
    const tasksCollection = collection(firestore, 'groups', groupId, 'tasks');
    await addDoc(tasksCollection, {
      title: newTaskTitle,
      content: newTaskContent,
      type: newTaskType,
      createdAt: new Date()
    });
    setOpenModal(false);
    setNewTaskTitle('');
    setNewTaskContent('');
    setNewTaskType('announcement');
    // Refetch tasks
    const tasksSnapshot = await getDocs(tasksCollection);
    const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(tasksData);
  };

  const handleDeleteTask = async (taskId) => {
    const taskDocRef = doc(firestore, 'groups', groupId, 'tasks', taskId);
    await deleteDoc(taskDocRef);
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className='list-container'>
    <Container>
      <Box sx={{ borderRadius: 2, boxShadow: 3, padding: 3, backgroundColor: 'white', marginTop: '100px', marginBottom: '100px' }}>
        <Typography variant="h4" gutterBottom>
          Tareas y Publicaciones
        </Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => setOpenModal(true)}>Agregar</Button>
        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Contenido</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.content}</TableCell>
                  <TableCell>
                    <IconButton color="secondary" onClick={() => handleDeleteTask(task.id)}>
                      <Delete />
                    </IconButton>
                    {task.type === 'task' && (
                      <IconButton color="primary" onClick={() => navigate(`${task.id}`)}>
                        <Visibility />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="add-task-modal-title"
        aria-describedby="add-task-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" id="add-task-modal-title">
            Agregar Tarea/Publicación
          </Typography>
          <TextField
            fullWidth
            label="Título"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contenido"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            select
            label="Tipo"
            value={newTaskType}
            onChange={(e) => setNewTaskType(e.target.value)}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="announcement">Anuncio</option>
            <option value="task">Tarea</option>
          </TextField>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ mr: 2 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleAddTask}>Agregar</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
    </div>
  );
};

export default GroupTasksBoard;
