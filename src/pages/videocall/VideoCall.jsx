import React, { useState, useRef, useEffect, useContext } from 'react';
import Peer from 'peerjs';
import { UserContext } from '../../context/UserContext';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from '../../connection/firebaseConfig';
import { Autocomplete, TextField, Button, Grid, Typography } from '@mui/material';
import { styled } from '@mui/system';
import CallEndIcon from '@mui/icons-material/CallEnd';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'red',
  '&:hover': {
    backgroundColor: 'darkred',
  },
}));

const VideoCall = () => {
  const [peer, setPeer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteUserId, setRemoteUserId] = useState('');
  const [users, setUsers] = useState([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { currentUser } = useContext(UserContext);
  const uidf = currentUser.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(firestore, "users"));
      const usersList = [];
      const usernameCount = {};

      // First pass to count usernames
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.uid !== currentUser.uid && user.role !== 'admin') {
          if (!usernameCount[user.username]) {
            usernameCount[user.username] = 0;
          }
          usernameCount[user.username]++;
        }
      });

      // Second pass to create user list with email for duplicates
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.uid !== currentUser.uid && user.role !== 'admin') {
          let label = `${user.username} (${user.role})`;
          if (usernameCount[user.username] > 1) {
            const emailWithoutDomain = user.email.split('@')[0];
            label += ` - ${emailWithoutDomain}`;
          }
          usersList.push({
            label,
            value: doc.id, // Use doc.id to get the UID of the document
            role: user.role
          });
        }
      });

      setUsers(usersList);
    };

    fetchUsers();
  }, [currentUser.uid]);

  useEffect(() => {
    const newPeer = new Peer(uidf);
    setPeer(newPeer);

    newPeer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
          remoteVideoRef.current.srcObject = remoteStream;
        });

        call.on('close', () => {
          // Handle the call close event
          window.location.reload();
        });

        call.on('error', () => {
          // Handle the call error event
          window.location.reload();
        });
      });
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      newPeer.destroy();
    };
  }, [uidf]);

  // Monitor remoteStream and reload the page if the stream is lost after being established
  useEffect(() => {
    if (remoteStream) {
      const onStreamEnded = () => {
        window.location.reload();
      };

      remoteStream.getTracks().forEach((track) => {
        track.addEventListener('ended', onStreamEnded);
      });

      return () => {
        remoteStream.getTracks().forEach((track) => {
          track.removeEventListener('ended', onStreamEnded);
        });
      };
    }
  }, [remoteStream]);

  const startCall = () => {
    if (remoteUserId.trim() !== '') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
        const call = peer.call(remoteUserId, stream);
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
          remoteVideoRef.current.srcObject = remoteStream;
        });

        call.on('close', () => {
          // Handle the call close event
          window.location.reload();
        });

        call.on('error', () => {
          // Handle the call error event
          window.location.reload();
        });
      });
    } else {
      alert('Please enter a valid user ID to call.');
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      setRemoteStream(null);
    }
    if (peer) {
      peer.destroy();
      setPeer(new Peer(uidf));
      window.location.reload();
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Video Llamada</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <video ref={localVideoRef} autoPlay muted style={{ width: '100%', border: '1px solid black' }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <video ref={remoteVideoRef} autoPlay style={{ width: '100%', border: '1px solid black' }} />
        </Grid>
      </Grid>
      <Autocomplete
        options={users}
        getOptionLabel={(option) => option.label}
        onChange={(event, newValue) => {
          setRemoteUserId(newValue ? newValue.value : '');
        }}
        renderInput={(params) => <TextField {...params} label="Select User" variant="outlined" />}
        style={{ marginTop: 20, marginBottom: 20 }}
      />
      <Button variant="contained" color="primary" onClick={startCall} style={{ marginRight: 10 }}>
        Iniciar llamada
      </Button>
      <StyledButton variant="contained" onClick={endCall} startIcon={<CallEndIcon />}>
        Colgar llamada
      </StyledButton>
      <Typography variant="body1" style={{ marginTop: 20 }}>
        Ambos usuarios deben estar en la ventana de VideoCall para que la funcionalidad funcione. Selecciona un usuario y haz clic en "Iniciar llamada".
      </Typography>
    </div>
  );
};

export default VideoCall;
