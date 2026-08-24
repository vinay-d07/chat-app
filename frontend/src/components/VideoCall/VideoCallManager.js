import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

// idle | calling (outgoing, ringing) | ringing (incoming) | in-call
const VideoCallManager = () => {
  const { user, socket, callToInitiate, setCallToInitiate } = ChatState();
  const toast = useToast();

  const [callStatus, setCallStatus] = useState("idle");
  const [peerInfo, setPeerInfo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const incomingOfferRef = useRef(null);
  const peerInfoRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    peerInfoRef.current = peerInfo;
  }, [peerInfo]);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    pendingCandidatesRef.current = [];
    incomingOfferRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallStatus("idle");
    setPeerInfo(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  // End the call for the other side if this component (or the tab) goes away mid-call.
  useEffect(() => {
    return () => {
      if (peerInfoRef.current) {
        socket.emit("call:end", { to: peerInfoRef.current._id });
      }
      if (pcRef.current) pcRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createPeerConnection = useCallback(
    (targetId) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:ice-candidate", {
            to: targetId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [socket]
  );

  // Outgoing call, triggered from SingleChat's "Video Call" button via context.
  useEffect(() => {
    if (!callToInitiate) return;
    const targetUser = callToInitiate;
    setCallToInitiate(null);

    if (callStatus !== "idle") {
      toast({
        title: "You're already on a call",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    (async () => {
      try {
        setPeerInfo(targetUser);
        setCallStatus("calling");
        const stream = await getLocalStream();
        const pc = createPeerConnection(targetUser._id);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call:user", {
          to: targetUser._id,
          from: { _id: user._id, name: user.name, pic: user.pic },
          offer,
          callType: "video",
        });
      } catch (err) {
        toast({
          title: "Could not start call",
          description: "Camera/microphone access is required.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        cleanup();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callToInitiate]);

  // Signaling listeners.
  useEffect(() => {
    const handleIncoming = ({ from, offer }) => {
      if (callStatus !== "idle") {
        socket.emit("call:reject", { to: from._id });
        return;
      }
      incomingOfferRef.current = offer;
      setPeerInfo(from);
      setCallStatus("ringing");
    };

    const handleAnswer = async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      for (const candidate of pendingCandidatesRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidatesRef.current = [];
      setCallStatus("in-call");
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      if (pcRef.current && pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const handleRejected = () => {
      toast({
        title: "Call declined",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      cleanup();
    };

    const handleEnded = () => {
      cleanup();
    };

    socket.on("call:incoming", handleIncoming);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:rejected", handleRejected);
    socket.on("call:ended", handleEnded);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:rejected", handleRejected);
      socket.off("call:ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  const acceptCall = async () => {
    try {
      const stream = await getLocalStream();
      const pc = createPeerConnection(peerInfo._id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingOfferRef.current)
      );
      for (const candidate of pendingCandidatesRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", { to: peerInfo._id, answer });
      setCallStatus("in-call");
    } catch (err) {
      toast({
        title: "Could not join call",
        description: "Camera/microphone access is required.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      if (peerInfo) socket.emit("call:reject", { to: peerInfo._id });
      cleanup();
    }
  };

  const declineCall = () => {
    if (peerInfo) socket.emit("call:reject", { to: peerInfo._id });
    cleanup();
  };

  const endCall = () => {
    if (peerInfo) socket.emit("call:end", { to: peerInfo._id });
    cleanup();
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getAudioTracks()
      .forEach((t) => (t.enabled = isMuted));
    setIsMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getVideoTracks()
      .forEach((t) => (t.enabled = isCameraOff));
    setIsCameraOff((prev) => !prev);
  };

  if (callStatus === "idle") return null;

  // Incoming call popup.
  if (callStatus === "ringing") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-sm mx-4 bg-white rounded-[32px] border border-[#E8E8E8] shadow-xl p-8 flex flex-col items-center gap-5 text-center">
          <img
            src={peerInfo?.pic}
            alt={peerInfo?.name}
            className="w-24 h-24 rounded-full border border-[#E8E8E8] object-cover shadow-sm"
          />
          <div>
            <h3 className="font-extrabold text-xl text-[#111111]">
              {peerInfo?.name}
            </h3>
            <p className="text-sm text-[#6B6B6B] mt-1">Incoming video call…</p>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={declineCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors"
              title="Decline"
            >
              <svg className="w-6 h-6 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 01-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .27-.11.52-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
              </svg>
            </button>
            <button
              onClick={acceptCall}
              className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-sm transition-colors"
              title="Accept"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Outgoing / active call overlay.
  return (
    <div className="fixed inset-0 z-50 bg-[#111111] flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black"
        />

        {callStatus === "calling" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70">
            <img
              src={peerInfo?.pic}
              alt={peerInfo?.name}
              className="w-28 h-28 rounded-full border-2 border-white/30 object-cover"
            />
            <h3 className="text-white font-extrabold text-xl">{peerInfo?.name}</h3>
            <p className="text-white/70 text-sm">Calling…</p>
          </div>
        )}

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-6 right-6 w-32 h-44 sm:w-40 sm:h-56 rounded-2xl border border-white/20 object-cover shadow-xl bg-black [transform:scaleX(-1)]"
        />

        <div className="absolute top-6 left-6 text-white">
          <p className="font-bold text-lg leading-none">{peerInfo?.name}</p>
          <p className="text-white/60 text-xs mt-1">
            {callStatus === "in-call" ? "Connected" : "Calling…"}
          </p>
        </div>
      </div>

      <div className="py-6 flex items-center justify-center gap-4 bg-[#111111]">
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? "bg-white text-[#111111]" : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9 9v3a3 3 0 004.24 2.73M15 9.34V5a3 3 0 00-5.94-.6M5 10v1a7 7 0 0010.29 6.19M12 18.5V21m-4 0h8" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a3.5 3.5 0 003.5-3.5V6a3.5 3.5 0 10-7 0v9a3.5 3.5 0 003.5 3.5zm7-6.5a7 7 0 01-14 0M12 18.5V21m-4 0h8" />
            </svg>
          )}
        </button>

        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors"
          title="End call"
        >
          <svg className="w-6 h-6 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 01-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .27-.11.52-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
          </svg>
        </button>

        <button
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isCameraOff ? "bg-white text-[#111111]" : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title={isCameraOff ? "Turn camera on" : "Turn camera off"}
        >
          {isCameraOff ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M15 10l4.553-2.276A1 1 0 0121 8.618v6.764M5 6h3l2-2h1M5 18h8a2 2 0 002-2v-2" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoCallManager;
