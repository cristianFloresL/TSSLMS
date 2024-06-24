import React, { useEffect, useState, useContext } from 'react';
import { firestore } from '../../connection/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UserContext } from '../../context/UserContext';
import { FaRegFrown } from 'react-icons/fa'; // Icono para mensaje de no cursos suscritos

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const StyledCard = styled(Card)({
  maxWidth: 345,
  margin: '1rem',
  position: 'relative',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },
});

const StyledCardMedia = styled(CardMedia)({
  height: 140,
});

const GroupBadge = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: '0.5rem',
  borderRadius: '5px',
}));

const SubscribedCourses = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserGroups = async () => {
      setLoading(true); // Comienza el estado de carga

      if (currentUser && currentUser !== 'invitado') {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.courses) {
            // Obtener los detalles de los grupos desde la colección 'groups'
            const groupsDetails = await Promise.all(userData.courses.map(async course => {
              const groupDoc = await getDoc(doc(firestore, 'groups', course.courseId));
              return groupDoc.exists() ? { id: course.courseId, ...groupDoc.data() } : null;
            }));
            // Filtrar grupos que existen
            const filteredGroups = groupsDetails.filter(group => group !== null);
            setUserGroups(filteredGroups);
          }
        }
      }

      setLoading(false); // Finaliza el estado de carga
    };

    fetchUserGroups();
  }, [currentUser]);

  const handleCardClick = (groupId) => {
    navigate(`/User/viewcourse/${groupId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box mt={3} mx="auto" maxWidth={1200} px={3}>
        {loading ? (
          <Box py={2} mb={3} textAlign="center">
            <CircularProgress /> {/* Indicador de carga */}
          </Box>
        ) : userGroups.length > 0 ? (
          <React.Fragment>
            <Box py={2} mb={3} bgcolor="#f0f0f0" borderRadius={5} textAlign="center">
              <Typography variant="h4" gutterBottom style={{ color: '#1f2029', fontWeight: 'bold', marginTop: '7px' }}>
                Grupos en los que te has inscrito
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {userGroups.map((group) => (
                <Grid item xs={12} sm={6} md={4} key={group.id}>
                  <StyledCard onClick={() => handleCardClick(group.id)}>
                    <StyledCardMedia
                      image={group.imageUrl || 'default-image-url'}
                      title={group.groupName}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {group.groupName}
                      </Typography>
                    </CardContent>
                    <GroupBadge style={{ backgroundColor: '#1e293b' }}>
                      {group.groupCode}
                    </GroupBadge>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </React.Fragment>
        ) : (
          <Box py={2} mb={3} textAlign="center">
            <Typography variant="h4" gutterBottom style={{ color: '#1f2029', fontWeight: 'bold', marginTop: '7px' }}>
              No estás suscrito a ningún grupo
            </Typography>
            <FaRegFrown style={{ fontSize: '3rem', color: '#1976d2', marginTop: '1rem' }} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default SubscribedCourses;
