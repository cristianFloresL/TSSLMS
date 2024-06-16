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
  const [modules, setModules] = useState([[], [], [], []]); // 4 modules initially empty
  const [existingFiles, setExistingFiles] = useState([[], [], [], []]); // 4 modules for existing files
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
      const updatedExistingFiles = [[], [], [], []];
      for (let i = 0; i < 4; i++) {
        const moduleRef = collection(firestore, `clases/${courseId}/modulo${i + 1}`);
        const moduleSnapshot = await getDocs(moduleRef);
        const moduleFiles = [];

        for (const doc of moduleSnapshot.docs) {
          const fileData = doc.data();
          moduleFiles.push({ id: doc.id, ...fileData });
        }

        updatedExistingFiles[i] = moduleFiles;
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

  const handleFileChange = (e, moduleIndex) => {
    const files = Array.from(e.target.files);
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = [...updatedModules[moduleIndex], ...files];
    setModules(updatedModules);
  };

  const handleRemoveFile = (moduleIndex, fileIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = updatedModules[moduleIndex].filter((_, index) => index !== fileIndex);
    setModules(updatedModules);

    // Reset file input value
    if (fileInputs.current[moduleIndex]) {
      fileInputs.current[moduleIndex].value = "";
    }
  };

  const handleDeleteExistingFile = (moduleIndex, file) => {
    setFileToDelete({ moduleIndex, file });
    setOpenDialog(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    const { moduleIndex, file } = fileToDelete;

    try {
      // Delete from Firestore
      const fileDocRef = doc(firestore, `clases/${courseId}/modulo${moduleIndex + 1}`, file.id);
      await deleteDoc(fileDocRef);

      // Delete from Firebase Storage
      const fileRef = ref(storage, `courses/${courseId}/modulo${moduleIndex + 1}/${file.name}`);
      await deleteObject(fileRef);

      // Update state
      const updatedExistingFiles = [...existingFiles];
      updatedExistingFiles[moduleIndex] = updatedExistingFiles[moduleIndex].filter(f => f.id !== file.id);
      setExistingFiles(updatedExistingFiles);
    } catch (error) {
      console.error("Error deleting file: ", error);
    } finally {
      setOpenDialog(false);
      setFileToDelete(null);
    }
  };

  const handleEditExistingFile = (moduleIndex, file) => {
    setFileToEdit({ moduleIndex, file });
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

    const { moduleIndex, file } = fileToEdit;

    try {
      // Update Firestore document
      const fileDocRef = doc(firestore, `clases/${courseId}/modulo${moduleIndex + 1}`, file.id);
      await updateDoc(fileDocRef, editData);

      // Update state
      const updatedExistingFiles = [...existingFiles];
      const fileIndex = updatedExistingFiles[moduleIndex].findIndex(f => f.id === file.id);
      if (fileIndex !== -1) {
        updatedExistingFiles[moduleIndex][fileIndex] = {
          ...updatedExistingFiles[moduleIndex][fileIndex],
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

  const renderPreview = (files, moduleIndex, existing = false) => {
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
          onClick={() => existing ? handleDeleteExistingFile(moduleIndex, file) : handleRemoveFile(moduleIndex, index)}
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
            onClick={() => handleEditExistingFile(moduleIndex, file)}
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
      await updateDoc(docRef, {
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        englishLevel: course.englishLevel,
      });
      const subcollectionNames = [];
      for (let i = 0; i < modules.length; i++) {
        const moduleFiles = modules[i];
        if (moduleFiles.length > 0) {
          const moduleRef = collection(docRef, `modulo${i + 1}`);
          subcollectionNames.push(`modulo${i + 1}`);

          for (const file of moduleFiles) {
            const fileRef = ref(storage, `courses/${courseId}/modulo${i + 1}/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileURL = await getDownloadURL(fileRef);

            await addDoc(moduleRef, {
              name: file.name,
              url: fileURL,
              type: file.type.includes("video") ? "video" : "pdf",
            });
          }
        }
      }
      if (subcollectionNames.length > 0) {
        await updateDoc(docRef, {
          subcollections: subcollectionNames,
        });
      }
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
            <FormControl variant="outlined" sx={{ minWidth: '100%' , textAlign:'left'}}>
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
                style={{ borderRadius: '10px', width: '100%', maxWidth: '300px' }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      {[...Array(4)].map((_, index) => (
        <Paper key={index} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography variant="h5">Módulo {index + 1}</Typography>
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
          <div>{renderPreview(modules[index], index)}</div>
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
