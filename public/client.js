const socket = io("http://localhost:3000");
const roomName = "room1";
const localVideo = document.getElementById("localVideo");
const remoteVideoStream = document.getElementById("remote-stream-video");

let localStream;
const remotePeers = {};

const send = (event, data) => socket.emit(event, data);
const listen = (event, callback) => socket.on(event, callback);

const constraints = {
  video: {
    width: { max: 640 },
    height: { max: 480 },
    frameRate: { ideal: 15 },
    facingMode: "user",
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
};

const initializeMediaStream = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localStream;
    send("joinRoom", roomName);
  } catch (error) {
    console.error("Error accessing media devices:", error);
  }
};

const createPeerConnection = (remoteSocketId) => {
  if (!remotePeers[remoteSocketId]) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    if (localStream)
      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (e) => handleRemoteTrack(e, remoteSocketId);
    peerConnection.onicecandidate = (event) =>
      handleIceCandidate(event, remoteSocketId);

    remotePeers[remoteSocketId] = peerConnection;
    return peerConnection;
  }
};

const sendOffer = async (remoteSocketId, peerConnection) => {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    send("offer", {
      offer: peerConnection.localDescription,
      to: remoteSocketId,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
  }
};

const handleRemoteTrack = (event, remoteSocketId) => {
  let remoteVideo = document.getElementById(`remoteVideo_${remoteSocketId}`);
  if (!remoteVideo) {
    remoteVideo = document.createElement("video");
    remoteVideo.id = `remoteVideo_${remoteSocketId}`;
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideoStream.appendChild(remoteVideo);
  }
  remoteVideo.srcObject = event.streams[0];
};

const handleIceCandidate = (event, remoteSocketId) => {
  if (event.candidate) {
    send("iceCandidate", { iceCandidate: event.candidate, to: remoteSocketId });
  }
};

const handleUserDisconnect = ({ socketId }) => {
  const remoteVideo = document.getElementById(`remoteVideo_${socketId}`);
  if (remoteVideo) remoteVideo.parentNode.removeChild(remoteVideo);
  delete remotePeers[socketId];
};

const handleOffer = async (data) => {
  const peerConnection = createPeerConnection(data.from);
  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    send("answer", { answer: peerConnection.localDescription, to: data.from });
  } catch (error) {
    console.error("Error handling offer:", error);
  }
};

const handleAccepted = (data) => {
  const peerConnection = remotePeers[data.from];
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(data.answer))
    .catch((error) => console.error("Error handling answer:", error));
};

const handleNewIceCandidate = async (data) => {
  if (data.iceCandidate) {
    const iceCandidate = new RTCIceCandidate(data.iceCandidate);
    const peerConnection = remotePeers[data.from];
    await peerConnection
      .addIceCandidate(iceCandidate)
      .catch((error) => console.error("Error handling ICE candidate:", error));
  }
};

const handleNewUserJoined = ({ socketId }) => {
  console.log("new user joined");
  const peerConnection = createPeerConnection(socketId);
  sendOffer(socketId, peerConnection);
};

const setupSocketListeners = () => {
  listen("newUserJoined", handleNewUserJoined);
  listen("onOffer", handleOffer);
  listen("accepted", handleAccepted);
  listen("newIceCandidate", handleNewIceCandidate);
  listen("onDisconnect", handleUserDisconnect);
};

initializeMediaStream();
setupSocketListeners();
