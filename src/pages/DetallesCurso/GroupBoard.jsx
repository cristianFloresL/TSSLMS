import React, { useState, useEffect, useContext } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { firestore, storage } from '../../connection/firebaseConfig';
import { UserContext } from '../../context/UserContext';
import { SearchContext } from '../../context/SearchContext';
import {
  Box,
  Button,
  Container,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import { Delete, CloudUpload } from '@mui/icons-material';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const GroupBoard = () => {
  const { groupC } = useContext(SearchContext);
  const { currentUser } = useContext(UserContext);
  const [boardItems, setBoardItems] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemType, setNewItemType] = useState('announcement'); // default type
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [openFileModal, setOpenFileModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const groupId = groupC;
  const [borra, setborra] = useState("")
  useEffect(() => {
    const fetchBoardItems = async () => {
      const boardCollection = collection(firestore, 'groups', groupId, 'tasks');
      const boardSnapshot = await getDocs(boardCollection);
      const boardData = boardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBoardItems(boardData);
    };

    fetchBoardItems();
  }, [groupId]);

  const checkFilesExist = async (task) => {
    try {
      const listRef = ref(storage, `groups/${groupId}/tasks/${task.id}/${currentUser.uid}`);
      
      const res = await listAll(listRef);
      console.log(res.items[0]._location.path_);
      if (res.items.length > 0) {
        // Files exist
        setborra(res.items[0]._location.path_);
        setFileUrl(await getDownloadURL(res.items[0])); // Assuming you want to get the URL of the first file
        setMessage('File exists');

      } else {
        // No files found
        setMessage('No files found');
      }
    } catch (error) {
      console.error('Error checking files:', error);
      //setMessage('Error checking files');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setFile(file);
    if (file) {
      setLoading(true);
      const fileRef = ref(storage, `groups/${groupId}/tasks/${selectedTask.id}/${currentUser.uid}/${file.name}`);

      await uploadBytes(fileRef, file);
      console.log(fileRef);
      const url = await getDownloadURL(fileRef);
      setFileUrl(url);
      setLoading(false);
    } else {
      setMessage('Error: No file selected');
    }
  };

  const handleFileSubmit = async () => {
    if (!fileUrl) {
      setMessage('Error: File URL not available');
      return;
    }

    const taskDocRef = doc(firestore, 'groups', groupId, 'tasks', selectedTask.id);
    await updateDoc(taskDocRef, {
      submissions: arrayUnion({
        userId: currentUser.uid,
        fileUrl: fileUrl,
        grade: 'none'
      })
    });
    setOpenFileModal(false);
    setFile(null);
    setFileUrl('');
    setMessage('File uploaded successfully');
    // Refetch board items
    const boardSnapshot = await getDocs(collection(firestore, 'groups', groupId, 'tasks'));
    const boardData = boardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBoardItems(boardData);
  };

  const handleDeleteFile = async () => {
    if (!fileUrl) {
      setMessage('Error: No file URL found');
      return;
    }
  
    setLoading(true);
    try {
      let fileRef;
      if (borra === "") {
        fileRef = ref(storage, `groups/${groupId}/tasks/${selectedTask.id}/${currentUser.uid}/${file.name}`);
      } else {
        fileRef = ref(storage, borra);
      }
  
      console.log("Deleting file:", fileRef);
      await deleteObject(fileRef);
  
      const taskDocRef = doc(firestore, 'groups', groupId, 'tasks', selectedTask.id);
      await updateDoc(taskDocRef, {
        submissions: arrayRemove({
          userId: currentUser.uid,
          fileUrl: fileUrl,
          grade: 'none'
        })
      });
  
      setFileUrl('');
      setFile(null);
      setLoading(false);
      setMessage('File deleted successfully');
  
      // Refetch board items
      const boardSnapshot = await getDocs(collection(firestore, 'groups', groupId, 'tasks'));
      const boardData = boardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBoardItems(boardData);
  
      //setOpenFileModal(false); // Cerrar el modal después de eliminar el archivo
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage('Error deleting file');
      setLoading(false);
    }
  };
  

  const handleOpenFileModal = async (task) => {
    setMessage("");
    setSelectedTask(task);
    setOpenFileModal(true);
    await checkFilesExist(task); // Pasar task directamente
  };

  const handleOpenTaskModal = (task) => {
    setSelectedTask(task);
    setOpenTaskModal(true);
  };
  
  return (
    <Container>
      <Box>
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
              {boardItems.map((item) => (
                <TableRow key={item.id} onClick={() => handleOpenTaskModal(item)}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.content.substring(0, 50)}...</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {item.type === 'task' && (
                      <IconButton color="primary" onClick={() => handleOpenFileModal(item)}>
                        <CloudUpload />
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
        open={openFileModal}
        onClose={() => setOpenFileModal(false)}
        aria-labelledby="file-modal-title"
        aria-describedby="file-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%', // Ajustar el tamaño del modal
          height: '80%', // Ajustar el tamaño del modal
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" id="file-modal-title">
            Subir Archivo
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              {fileUrl ? (
                <Box sx={{ height: '65vh' }}>
                  <Typography variant="body1">Archivo Subido:</Typography>
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
                  </Worker>
                  <Button variant="contained" color="secondary" onClick={handleDeleteFile}>Eliminar</Button>
                </Box>
              ) : (
                <Box>
                  <input type="file" accept="application/pdf" onChange={handleFileUpload} />
                  <Button variant="contained" onClick={handleFileSubmit}>Subir</Button>
                </Box>
              )}
            </>
          )}
          {message && <Typography variant="body2" color="error">{message}</Typography>}
        </Box>
      </Modal>
      <Modal
        open={openTaskModal}
        onClose={() => setOpenTaskModal(false)}
        aria-labelledby="task-modal-title"
        aria-describedby="task-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '50%',
          minHeight: '30%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '80%', // Ajustar el tamaño del modal
          maxHeight: '70%', // Ajustar el tamaño del modal
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" id="task-modal-title">
            Detalles de la Tarea
          </Typography>
          {selectedTask && (
            <Box>
              <Typography variant="body1"><strong>Título:</strong> {selectedTask.title}</Typography>
              <Typography variant="body1"><strong>Contenido:</strong> {selectedTask.content}</Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default GroupBoard;
