const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const remoteVideos = document.getElementById('js-remote-streams');
  const roomId = document.getElementById('js-room-id');
  const roomMode = document.getElementById('js-room-mode');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const messages = document.getElementById('js-messages');
  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');

  const toggleCamera = document.getElementById('js-toggle-camera');
  const toggleMicrophone = document.getElementById('js-toggle-microphone');
  const cameraStatus = document.getElementById('camera-status');
  const microphoneStatus = document.getElementById('microphone-status');
  
  toggleCamera.addEventListener('click', () => {
    const videoTracks = localStream.getVideoTracks()[0];
    videoTracks.enabled = !videoTracks.enabled;
    cameraStatus.textContent = `カメラ${videoTracks.enabled ? 'ON' : 'OFF'}`;
  });
  
  toggleMicrophone.addEventListener('click', () => {
    const audioTracks = localStream.getAudioTracks()[0];
    audioTracks.enabled = !audioTracks.enabled;
    microphoneStatus.textContent = `マイク${audioTracks.enabled ? 'ON' : 'OFF'}`;
  });


  meta.innerText = `
    UA: ${navigator.userAgent}
    SDK: ${sdkSrc ? sdkSrc.src : 'unknown'}
  `.trim();

  const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'mesh');

  roomMode.textContent = getRoomModeByHash();
  window.addEventListener(
    'hashchange',
    () => (roomMode.textContent = getRoomModeByHash())
  );

  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .catch(console.error);

  // Render local stream
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  // eslint-disable-next-line require-atomic-updates
  const peer = (window.peer = new Peer({
    key: window.__SKYWAY_KEY__,
    debug: 3,
  }));

  // Register join handler
  joinTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }

    const room = peer.joinRoom(roomId.value, {
      mode: getRoomModeByHash(),
      stream: localStream,
    });

    room.once('open', () => {
      messages.textContent += '=== You joined ===\n';
    });
    room.on('peerJoin', peerId => {
      messages.textContent += `=== ${peerId} joined ===\n`;
    });

    // Render remote stream for new peer join in the room
    room.on('stream', async stream => {
      const newVideo = document.createElement('video');
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      newVideo.setAttribute('data-peer-id', stream.peerId);
      remoteVideos.append(newVideo);
      var frames = document.getElementsByTagName('video');
      // frames[0]は、ローカルカメラ
      try{ //上
        frames[1].style.position = 'absolute';
        frames[1].style.top = '80px';
        frames[1].style.left = '550px';
        frames[1].style.width = '100px';
        frames[1].style.height= 'auto';
      } catch(e) {console.log( e.message );}
      if( 2 < frames.length ) {
        try{//左1列目
          frames[2].style.position = 'absolute';
          frames[2].style.top = '120px';
          frames[2].style.left = '280px';
          frames[2].style.width = '100px';
          frames[2].style.height= 'auto';
          frames[2].style.transform = "skew(0, -20deg)";
        } catch(e) { console.log(e.message);}
      }
      if( 3 < frames.length ) {
        try{//右1列目
          frames[3].style.position = 'absolute';
          frames[3].style.top = '120px';
          frames[3].style.left = '850px';
          frames[3].style.width = '100px';
          frames[3].style.height= 'auto';
          frames[3].style.transform = "skew(0, 20deg)";
        } catch(e) {console.log( e.message );}
      }
      if( 4 < frames.length ) {
        try{//左2列目
          frames[4].style.position = 'absolute';
          frames[4].style.top = '220px';
          frames[4].style.left = '130px';
          frames[4].style.width = '100px';
          frames[4].style.height= 'auto';
          frames[4].style.transform = "skew(0, -50deg)";
        } catch(e) {console.log( e.message );}
      }
      if( 5 < frames.length ) {
        try{//右2列目
          frames[5].style.position = 'absolute';
          frames[5].style.top = '220px';
          frames[5].style.left = '970px';
          frames[5].style.width = '100px';
          frames[5].style.height= 'auto';
          frames[5].style.transform = "skew(0, 50deg)";
        } catch(e) {console.log( e.message );}
      }
      if( 6 < frames.length ) {
        try{//左3列目
          frames[6].style.position = 'absolute';
          frames[6].style.top = '400px';
          frames[6].style.left = '150px';
          frames[6].style.width = '100px';
          frames[6].style.height= 'auto';
          frames[6].style.transform = "skew(0, 20deg)";
        } catch(e) {console.log( e.message );}
      }
      if( 7 < frames.length ) {
        try{//右3列目
          frames[7].style.position = 'absolute';
          frames[7].style.top = '400px';
          frames[7].style.left = '870px';
          frames[7].style.width = '100px';
          frames[7].style.height= 'auto';
          frames[7].style.transform = "skew(0, -20deg)";
        } catch(e) {console.log( e.message );}
      }
      await newVideo.play().catch(console.error);
    });

    room.on('data', ({ data, src }) => {
      // Show a message sent to the room and who sent
      messages.textContent += `${src}: ${data}\n`;
    });

    // for closing room members
    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id="${peerId}"]`
      );
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();

      messages.textContent += `=== ${peerId} left ===\n`;
    });

    // for closing myself
    room.once('close', () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += '== You left ===\n';
      Array.from(remoteVideos.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });

    sendTrigger.addEventListener('click', onClickSend);
    leaveTrigger.addEventListener('click', () => room.close(), { once: true });

    function onClickSend() {
      // Send message to all of the peers in the room via websocket
      room.send(localText.value);

      messages.textContent += `${peer.id}: ${localText.value}\n`;
      localText.value = '';
    }
  });

  peer.on('error', console.error);
})();
