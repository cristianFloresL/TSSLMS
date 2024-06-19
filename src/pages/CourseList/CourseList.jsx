import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { firestore, storage } from '../../connection/firebaseConfig';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Container, Box, Button, Modal, TextField, Typography } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CourseList = () => { 
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupCode, setEditGroupCode] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(firestore, "clases"));
      const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
    };

    const fetchGroups = async () => {
      const querySnapshot = await getDocs(collection(firestore, "groups"));
      const groupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsData);
    };

    fetchCourses();
    fetchGroups();
  }, []);

  const deleteFolderContents = async (folderRef) => {
    const listResponse = await listAll(folderRef);
    const deletePromises = listResponse.items.map((itemRef) => deleteObject(itemRef));

    const subfolderPromises = listResponse.prefixes.map((subfolderRef) => deleteFolderContents(subfolderRef));
    await Promise.all([...deletePromises, ...subfolderPromises]);
  };

  const deleteGroup = async () => {
    if (groupToDelete) {
      try {
        const groupDocRef = doc(firestore, "groups", groupToDelete);
        await deleteDoc(groupDocRef);

        const groupStorageRef = ref(storage, `groups/${groupToDelete}`);
        await deleteFolderContents(groupStorageRef);

        setGroups(groups.filter(group => group.id !== groupToDelete));
        setOpenDeleteModal(false);
        alert('Grupo eliminado exitosamente');
      } catch (error) {
        console.error("Error eliminando el grupo: ", error);
        alert('Hubo un error eliminando el grupo');
      }
    }
  };

  const handleDelete = (groupId) => {
    setGroupToDelete(groupId);
    setOpenDeleteModal(true);
  };

  const handleEdit = (group) => {
    setEditGroupId(group.id);
    setEditGroupName(group.groupName);
    setEditGroupDescription(group.groupDescription);
    setEditGroupCode(group.groupCode);
    setOpenEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const groupDocRef = doc(firestore, "groups", editGroupId);
      await updateDoc(groupDocRef, {
        groupName: editGroupName,
        groupDescription: editGroupDescription,
        groupCode: editGroupCode
      });
      setGroups(groups.map(group => group.id === editGroupId ? { ...group, groupName: editGroupName, groupDescription: editGroupDescription, groupCode: editGroupCode } : group));
      setOpenEditModal(false);
      alert('Grupo actualizado exitosamente');
    } catch (error) {
      console.error("Error actualizando el grupo: ", error);
      alert('Hubo un error actualizando el grupo');
    }
  };

  const handleEditCancel = () => {
    setOpenEditModal(false);
  };

  const handleCourseEdit = (courseId) => {
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
          <Typography variant="h4" gutterBottom>
            Gestionar Recursos
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre del Curso</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell>{truncateDescription(course.courseDescription, 10)}</TableCell>
                    <TableCell>
                      {course.imageUrl && <img src={course.imageUrl} alt={course.courseName} width="100" style={{ borderRadius: '10px' }} />}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleCourseEdit(course.id)}>
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            padding: 3,
            backgroundColor: 'white',
            marginBottom: '100px',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Grupos
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre del Grupo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.groupName}</TableCell>
                    <TableCell>{truncateDescription(group.groupDescription, 10)}</TableCell>
                    <TableCell>
                      {group.imageUrl && <img src={group.imageUrl} alt={group.groupName} width="100" style={{ borderRadius: '10px' }} />}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(group)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDelete(group.id)}>
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

      <Modal
        open={openEditModal}
        onClose={handleEditCancel}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
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
          <Typography variant="h6" id="edit-modal-title">
            Editar Grupo
          </Typography>
          <TextField
            fullWidth
            label="Nombre del Grupo"
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descripción del Grupo"
            value={editGroupDescription}
            onChange={(e) => setEditGroupDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Código del Grupo"
            value={editGroupCode}
            onChange={(e) => setEditGroupCode(e.target.value)}
            margin="normal"
            inputProps={{ maxLength: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleEditCancel} sx={{ mr: 2 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleEditSave}>Guardar</Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
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
          <Typography variant="h6" id="delete-modal-title">
            Confirmar Eliminación
          </Typography>
          <Typography id="delete-modal-description" sx={{ mt: 2 }}>
            ¿Estás seguro de que deseas eliminar este grupo?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenDeleteModal(false)} sx={{ mr: 2 }}>Cancelar</Button>
            <Button variant="contained" color="secondary" onClick={deleteGroup}>Eliminar</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default CourseList;