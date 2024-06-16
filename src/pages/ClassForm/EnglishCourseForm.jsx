import React, { useState } from 'react';
import { TextField, Button, MenuItem, FormControl, InputLabel, Select, Grid, Avatar, Box } from '@mui/material';
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage  } from '../../connection/firebaseConfig';
import "./EnglishForm.css";

const EnglishCourseForm = () => {
  const [courseImage, setCourseImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [englishLevel, setEnglishLevel] = useState('Principiante');
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseImage(reader.result);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const db = firestore;
    const stor = storage;
    const newCourseRef = doc(collection(db, "clases"));
    const courseId = newCourseRef.id;
    
    try {
      let imageUrl = '';
      
      if (imageFile) {
        const storageRef = ref(stor, `courses/${courseId}/images/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      await setDoc(newCourseRef, {
        courseName,
        courseDescription,
        englishLevel,
        imageUrl,
      });

      setCourseName('');
      setCourseDescription('');
      setEnglishLevel('Principiante');
      setCourseImage(null);
      setImageFile(null);
      alert('Curso creado exitosamente');

    } catch (error) {
      console.error("Error creando el curso: ", error);
      alert('Hubo un error creando el curso');
    }
  };

  return (
  <div id="ventanaForm" className="ventanaForm">
    <div className="english-container">    
    <div className="english-box">
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            fullWidth
            label="Nombre del Curso"
            name="courseName"
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            fullWidth
            label="Descripción del Curso"
            name="courseDescription"
            multiline
            rows={4}
            value={courseDescription}
            onChange={e => setCourseDescription(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl variant="outlined" sx={{ minWidth: '100%' , textAlign:'left'}}>
            <InputLabel id="level-select-label">Nivel de Inglés</InputLabel>
            <Select
                labelId="level-select-label"
                label="Nivel de Inglés"
                name="englishLevel"
                value={englishLevel}
                onChange={event => setEnglishLevel(event.target.value)}
                >
                <MenuItem value="Principiante">Principiante</MenuItem>
                <MenuItem value="Intermedio">Intermedio</MenuItem>
                <MenuItem value="Avanzado">Avanzado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <input
            accept="image/*"
            id="course-image-input"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="course-image-input">
            <Button variant="outlined" component="span">
              Seleccionar Imagen del Curso
            </Button>
          </label>
          {courseImage && (
            <Avatar alt="Course Image" src={courseImage} sx={{ width: 150, height: 150, margin: 'auto', marginTop: '10px'}} />
          )}
        </Grid>
        <Grid item xs={12}>
            <Button variant="contained" color="primary" fullWidth type="submit">
              Crear Curso
            </Button>
        </Grid>
      </Grid>
    </form>
    </div>
   </div>
 </div>
 );
};

export default EnglishCourseForm;
