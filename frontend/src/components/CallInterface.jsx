// CallInterface.jsx
import React, { useRef, useEffect } from 'react';

const CallInterface = ({ peer, isCallActive, endCall }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current && peer) {
            peer.on('stream', (stream) => {
                remoteVideoRef.current.srcObject = stream;
            });

            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    localVideoRef.current.srcObject = stream;
                    peer.addStream(stream);
                });
        }

        return () => {
            // Cleanup if needed
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        };
    }, [peer]);

    if (!isCallActive) return null;

    return (
        <div className="call-interface">
            <video ref={localVideoRef} autoPlay muted />
            <video ref={remoteVideoRef} autoPlay />
            <button onClick={endCall}>End Call</button>
        </div>
    );
};

export default CallInterface;