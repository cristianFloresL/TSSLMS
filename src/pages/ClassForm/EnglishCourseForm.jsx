import React, { useState } from 'react';
import { TextField, Button, Grid, Avatar } from '@mui/material';
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from '../../connection/firebaseConfig';
import "./EnglishForm.css";

const EnglishCourseForm = () => {
  const [groupImage, setGroupImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupCode, setGroupCode] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupImage(reader.result);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const db = firestore;
    const stor = storage;
    const newGroupRef = doc(collection(db, "groups"));
    const groupId = newGroupRef.id;

    try {
      let imageUrl = '';
      
      if (imageFile) {
        const storageRef = ref(stor, `groups/${groupId}/images/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      await setDoc(newGroupRef, {
        groupName,
        groupDescription,
        groupCode,
        imageUrl,
      });

      setGroupName('');
      setGroupDescription('');
      setGroupCode('');
      setGroupImage(null);
      setImageFile(null);
      alert('Grupo creado exitosamente');

    } catch (error) {
      console.error("Error creando el grupo: ", error);
      alert('Hubo un error creando el grupo');
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
            label="Nombre del Grupo"
            name="groupName"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            fullWidth
            label="Descripción del Grupo"
            name="groupDescription"
            multiline
            rows={4}
            value={groupDescription}
            onChange={e => setGroupDescription(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            fullWidth
            label="Grupo"
            name="groupCode"
            inputProps={{ maxLength: 3 }}
            value={groupCode}
            onChange={e => setGroupCode(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <input
            accept="image/*"
            id="group-image-input"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="group-image-input">
            <Button variant="outlined" component="span">
              Seleccionar Imagen del Grupo
            </Button>
          </label>
          {groupImage && (
            <Avatar alt="Group Image" src={groupImage} sx={{ width: 150, height: 150, margin: 'auto', marginTop: '10px'}} />
          )}
        </Grid>
        <Grid item xs={12}>
            <Button variant="contained" color="primary" fullWidth type="submit">
              Lanzar Grupo
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
