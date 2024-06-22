import React, { useState, useRef, useEffect } from 'react';
import Peer from 'peerjs';

const VideoCall = ({ userId }) => {
  const [peer, setPeer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteUserId, setRemoteUserId] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const newPeer = new Peer(userId);
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
      });
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      newPeer.destroy();
    };
  }, [userId]);

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
      });
    } else {
      alert('Please enter a valid user ID to call.');
    }
  };

  return (
    <div>
      <h2>Video Call</h2>
      <div>
        <video ref={localVideoRef} autoPlay muted style={{ width: '300px', border: '1px solid black' }} />
        <video ref={remoteVideoRef} autoPlay style={{ width: '300px', border: '1px solid black' }} />
      </div>
      <input
        type="text"
        placeholder="Remote user ID"
        value={remoteUserId}
        onChange={(e) => setRemoteUserId(e.target.value)}
      />
      <button onClick={startCall}>Start Call</button>
    </div>
  );
};

export default VideoCall;
