
# Multi Peer WebRTC Video Call

[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## Overview

This project is a multi-peer WebRTC (Web Real-Time Communication) video call application. WebRTC is a free, open-source project that provides web browsers and mobile applications with real-time communication via simple application programming interfaces (APIs).

## How it Works

WebRTC facilitates real-time audio and video communication between peers, directly in the web browser (serverless). Here's a simplified overview of how this multi-peer video call application works:

1. **User Joins a Room:**
   - Users connect to the application and join a specific room.

2. **Accessing Camera and Microphone:**
   - Upon joining, the application requests access to the user's camera and microphone using WebRTC's `navigator.mediaDevices.getUserMedia` API.

3. **Creating Peer Connection:**
   - A peer connection is established between each user in the same room. This is done using the `RTCPeerConnection` API.

4. **Offer and Answer Exchange:**
   - When a user wants to connect with another user, they send an "offer" using WebSockets (in this case, via the `socket.io` library).
   - The receiving user processes the offer and sends back an "answer."

5. **ICE Candidate Exchange:**
   - To establish a direct connection, Interactive Connectivity Establishment (ICE) candidates are exchanged between peers.

6. **Real-Time Video Stream:**
   - Once the connection is established, real-time video streams flow between connected peers.

7. **Handling Disconnections:**
   - Users can disconnect from the call, and the application gracefully handles these disconnections.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/justpingme/multipeer-webrtc.git
    ```

2. Navigate to the project directory:

    ```bash
    cd multipeer-webrtc
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

### Usage

1. Start the server:

    ```bash
    npm start
    ```

2. Open your browser and go to [http://localhost:3000](http://localhost:3000).

3. Join multiple users and start a video call.


## simple diagram representing the basic flow of WebRTC communication between two users:

          User A                        Signaling Server                     User B
    +--------------+                   +------------------+              +--------------+
    |              |                   |                  |              |              |
    |  Camera +    |                   |                  |              |    + Camera  |
    |  Microphone  |                   |                  |              |  Microphone  |
    |              |                   |                  |              |              |
    +-------|------+                   +--------|--------+               +---|----------+
            |                                   |                            |
            |   [Offer SDP, ICE Candidates]     |                            |
            | ------------------------------->  |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   | [Offer SDP, ICE Candidates]|
            |                                   | <--------------------------|
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |   [Answer SDP, ICE Candidates]    |                            |
            | <---------------------------------|                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
            |                                   |                            |
    +--------------+                    +------------------+            +--------------+
                                  Real-Time Video & Audio Stream




## License

This project is licensed under the [ISC License](LICENSE).
