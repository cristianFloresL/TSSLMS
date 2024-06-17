import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc, updateDoc, collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from '../../connection/firebaseConfig';
import { TextField, Button, Container, Grid, IconButton, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';

const EditCourse = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [topics, setTopics] = useState([[], [], [], [], []]); // 5 topics initially empty
  const [existingFiles, setExistingFiles] = useState([[], [], [], [], []]); // 5 topics for existing files
  const [openDialog, setOpenDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const fileInputs = useRef([]);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [fileToEdit, setFileToEdit] = useState(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    position: ''
  });

  useEffect(() => {
    const fetchCourse = async () => {
      const docRef = doc(firestore, "clases", courseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCourse(docSnap.data());
      } else {
        console.error("No such document!");
      }
    };

    const fetchExistingFiles = async () => {
      const updatedExistingFiles = [[], [], [], [], []];
      for (let i = 0; i < 5; i++) {
        const topicRef = collection(firestore, `clases/${courseId}/tema${i + 1}`);
        const topicSnapshot = await getDocs(topicRef);
        const topicFiles = [];

        for (const doc of topicSnapshot.docs) {
          const fileData = doc.data();
          topicFiles.push({ id: doc.id, ...fileData });
        }

        updatedExistingFiles[i] = topicFiles;
      }
      setExistingFiles(updatedExistingFiles);
    };

    fetchCourse();
    fetchExistingFiles();
  }, [courseId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleFileChange = (e, topicIndex) => {
    const files = Array.from(e.target.files);
    const updatedTopics = [...topics];
    updatedTopics[topicIndex] = [...updatedTopics[topicIndex], ...files];
    setTopics(updatedTopics);
  };

  const handleRemoveFile = (topicIndex, fileIndex) => {
    const updatedTopics = [...topics];
    updatedTopics[topicIndex] = updatedTopics[topicIndex].filter((_, index) => index !== fileIndex);
    setTopics(updatedTopics);

    // Reset file input value
    if (fileInputs.current[topicIndex]) {
      fileInputs.current[topicIndex].value = "";
    }
  };

  const handleDeleteExistingFile = (topicIndex, file) => {
    setFileToDelete({ topicIndex, file });
    setOpenDialog(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    const { topicIndex, file } = fileToDelete;

    try {
      // Delete from Firestore
      const fileDocRef = doc(firestore, `clases/${courseId}/tema${topicIndex + 1}`, file.id);
      await deleteDoc(fileDocRef);

      // Delete from Firebase Storage
      const fileRef = ref(storage, `courses/${courseId}/tema${topicIndex + 1}/${file.name}`);
      await deleteObject(fileRef);

      // Update state
      const updatedExistingFiles = [...existingFiles];
      updatedExistingFiles[topicIndex] = updatedExistingFiles[topicIndex].filter(f => f.id !== file.id);
      setExistingFiles(updatedExistingFiles);
    } catch (error) {
      console.error("Error deleting file: ", error);
    } finally {
      setOpenDialog(false);
      setFileToDelete(null);
    }
  };

  const handleEditExistingFile = (topicIndex, file) => {
    setFileToEdit({ topicIndex, file });
    setEditData({
      title: file.title || '',
      description: file.description || '',
      position: file.position || ''
    });
    setOpenEditDialog(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const confirmEditFile = async () => {
    if (!fileToEdit) return;

    const { topicIndex, file } = fileToEdit;

    try {
      // Update Firestore document
      const fileDocRef = doc(firestore, `clases/${courseId}/tema${topicIndex + 1}`, file.id);
      await updateDoc(fileDocRef, editData);

      // Update state
      const updatedExistingFiles = [...existingFiles];
      const fileIndex = updatedExistingFiles[topicIndex].findIndex(f => f.id === file.id);
      if (fileIndex !== -1) {
        updatedExistingFiles[topicIndex][fileIndex] = {
          ...updatedExistingFiles[topicIndex][fileIndex],
          ...editData
        };
      }
      setExistingFiles(updatedExistingFiles);
    } catch (error) {
      console.error("Error updating file: ", error);
    } finally {
      setOpenEditDialog(false);
      setFileToEdit(null);
    }
  };

  const renderPreview = (files, topicIndex, existing = false) => {
    return files.map((file, index) => (
      <div key={index} style={{ margin: '10px', display: 'inline-block', position: 'relative' }}>
        {file.type?.includes("video") || file.url?.includes("video") ? <VideoLibraryIcon style={{ fontSize: '50px' }} /> : <PictureAsPdfIcon style={{ fontSize: '50px' }} />}
        <Typography variant="body2">{file.name}</Typography>
        <IconButton
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)'
          }}
          onClick={() => existing ? handleDeleteExistingFile(topicIndex, file) : handleRemoveFile(topicIndex, index)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        {existing && (
          <IconButton
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              padding: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)'
            }}
            onClick={() => handleEditExistingFile(topicIndex, file)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </div>
    ));
  };

  const handleSave = async () => {
    try {
      const docRef = doc(firestore, "clases", courseId);

      // Actualizar los datos principales del curso
      await updateDoc(docRef, {
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        englishLevel: course.englishLevel,
      });

      // Array para almacenar los nombres de las subcolecciones activas
      const subcollectionNames = [];

      // Recorrer cada tema para verificar y actualizar su estado en la lista de subcolecciones
      for (let i = 0; i < topics.length; i++) {
        const topicFiles = topics[i];
        const existingFilesInTopic = existingFiles[i]; // Obtener los archivos existentes del tema

        // Verificar si el tema tiene archivos nuevos o existentes
        if (topicFiles.length > 0 || existingFilesInTopic.length > 0) {
          const topicRef = collection(docRef, `tema${i + 1}`);

          // Añadir el tema a la lista de subcolecciones
          subcollectionNames.push(`tema${i + 1}`);
          // Manejar archivos nuevos
          for (const file of topicFiles) {
            // Verificar si el archivo es nuevo o ya existe en los archivos existentes
            const fileExists = existingFilesInTopic.some(f => f.name === file.name);

            if (!fileExists) {
              const fileRef = ref(storage, `courses/${courseId}/tema${i + 1}/${file.name}`);
              await uploadBytes(fileRef, file);
              const fileURL = await getDownloadURL(fileRef);

              // Añadir documento a la subcolección del tema
              await addDoc(topicRef, {
                name: file.name,
                url: fileURL,
                type: file.type.includes("video") ? "video" : "pdf",
              });
            }
          }
        } else {
          // Si el tema está vacío, verificar si existe y eliminarlo de la lista de subcolecciones
          const topicSnapshot = await getDoc(doc(collection(docRef, `tema${i + 1}`)));
          if (topicSnapshot.exists()) {
            subcollectionNames.push(`tema${i + 1}`);
          }
        }
      }

      // Actualizar la lista de subcolecciones en el documento del curso
      await updateDoc(docRef, {
        subcollections: subcollectionNames,
      });

      alert("Curso actualizado exitosamente");
    } catch (error) {
      console.error("Error actualizando el curso: ", error);
      alert("Hubo un error al actualizar el curso");
    }
  };

  return (
    <Container>
      <Paper style={{ padding: '20px', marginTop: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">
              {course.courseName}
              <IconButton onClick={handleEditToggle}>
                <EditIcon />
              </IconButton>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {isEditing ? (
              <TextField
                fullWidth
                name="courseName"
                label="Nombre del Curso"
                value={course.courseName}
                onChange={handleInputChange}
              />
            ) : (
              <Typography variant="h6">{course.courseName}</Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            {isEditing ? (
              <TextField
                fullWidth
                name="courseDescription"
                label="Descripción"
                value={course.courseDescription}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            ) : (
              <Typography variant="body1">{course.courseDescription}</Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            {isEditing ? (
              <FormControl variant="outlined" sx={{ minWidth: '100%', textAlign: 'left' }}>
                <InputLabel id="level-select-label">Nivel de Inglés</InputLabel>
                <Select
                  labelId="level-select-label"
                  label="Nivel de Inglés"
                  name="englishLevel"
                  value={course.englishLevel}
                  onChange={handleInputChange}
                >
                  <MenuItem value="Principiante">Principiante</MenuItem>
                  <MenuItem value="Intermedio">Intermedio</MenuItem>
                  <MenuItem value="Avanzado">Avanzado</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1">Nivel: {course.englishLevel}</Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            {course.imageUrl && (
              <img
                src={course.imageUrl}
                alt={course.courseName}
                style={{ borderRadius: '10px', width: '100%', maxWidth: '150px' }} // Adjusted image size
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      {[...Array(5)].map((_, index) => ( // Changed to 5 topics
        <Paper key={index} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography variant="h5">Tema {index + 1}</Typography> {/* Changed to "Tema" */}
          <div>{renderPreview(existingFiles[index], index, true)}</div>
          <input
            id={`course-input-${index}`}
            type="file"
            multiple
            onChange={(e) => handleFileChange(e, index)}
            style={{ display: 'none' }}
            ref={(el) => (fileInputs.current[index] = el)}
          />
          <label htmlFor={`course-input-${index}`}>
            <Button variant="outlined" component="span">
              Selecciona los Recursos
            </Button>
          </label>
          <div>{renderPreview(topics[index], index)}</div>
        </Paper>
      ))}

      <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '20px' }}>
        Guardar
      </Button>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>{"Eliminar Recurso"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este recurso?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDeleteFile} color="primary" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
      >
        <DialogTitle>{"Editar Recurso"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Modifica los campos a continuación para editar el recurso.
          </DialogContentText>
          <TextField
            margin="dense"
            label="Título"
            name="title"
            value={editData.title}
            onChange={handleEditInputChange}
            fullWidth
          />
          {fileToEdit && fileToEdit.file.type?.includes("pdf") && (
            <TextField
              margin="dense"
              label="Descripción"
              name="description"
              value={editData.description}
              onChange={handleEditInputChange}
              fullWidth
              multiline
              rows={4}
            />
          )}
          <TextField
            margin="dense"
            label="Posición"
            name="position"
            value={editData.position}
            onChange={handleEditInputChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmEditFile} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditCourse;
