import React, { useEffect, useState } from 'react';
import { firestore } from '../../connection/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Grid, Box } from '@mui/material';
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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

const CoursesList = () => {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const groupsCollection = collection(firestore, 'groups');
      const groupsSnapshot = await getDocs(groupsCollection);
      const groupsList = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsList);
    };

    fetchGroups();
  }, []);

  const handleCardClick = (groupId) => {
    navigate(`/User/course/${groupId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box mt={3} mx="auto" maxWidth={1200} px={3}>
        <Box py={2} mb={3} bgcolor="#f0f0f0" borderRadius={5} textAlign="center">
          <Typography variant="h4" gutterBottom style={{ color: '#1f2029', fontWeight: 'bold', marginTop: '7px' }}>
            Grupos Disponibles
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {groups.map((group) => (
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
      </Box>
    </ThemeProvider>
  );
};

export default CoursesList;
