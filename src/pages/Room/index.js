import {useParams} from 'react-router';
import useWebRTC, {LOCAL_VIDEO} from '../../hooks/useWebRTC';
// import {useState} from "react";
// import microphonestop from '../../Icons/microphone-stop.svg'
// import microphone from '../../Icons/microphone.svg'
// import camera from '../../Icons/camera.svg'
// import camerastop from '../../Icons/camera-stop.svg'

function layout(clientsNumber = 1) {
  const pairs = Array.from({length: clientsNumber})
    .reduce((acc, next, index, arr) => {
      if (index % 2 === 0) {
        acc.push(arr.slice(index, index + 2));
      }

      return acc;
    }, []);

  const rowsNumber = pairs.length;
  const height = `${100 / rowsNumber}%`;

  return pairs.map((row, index, arr) => {

    if (index === arr.length - 1 && row.length === 1) {
      return [{
        width: '100%',
        height,
      }];
    }

    return row.map(() => ({
      width: '50%',
      height,
    }));
  }).flat();
}

export default function Room() {
    const {id: roomID} = useParams();
    const {clients, provideMediaRef} = useWebRTC(roomID);
    const videoLayout = layout(clients.length);

    // const [audioMuted, setAudioMuted] = useState(false)
    // const [videoMuted, setVideoMuted] = useState(false)
    //
    // let audioControl;
    // if(audioMuted){
    //     audioControl=<span className="iconContainer" onClick={()=>toggleMuteAudio()}>
    //   <img src={microphonestop} alt="Unmute audio"/>
    // </span>
    // } else {
    //     audioControl=<span className="iconContainer" onClick={()=>toggleMuteAudio()}>
    //   <img src={microphone} alt="Mute audio"/>
    // </span>
    // }
    //
    // let videoControl;
    // if(videoMuted){
    //     videoControl=<span className="iconContainer" onClick={()=>toggleMuteVideo()}>
    //   <img src={camerastop} alt="Resume video"/>
    // </span>
    // } else {
    //     videoControl=<span className="iconContainer" onClick={()=>toggleMuteVideo()}>
    //   <img src={camera} alt="Stop audio"/>
    // </span>
    // }

    // function toggleMuteAudio(){
    //     if(stream){
    //         setAudioMuted(!audioMuted)
    //         stream.getAudioTracks()[0].enabled = audioMuted
    //     }
    // }
    // function toggleMuteVideo(){
    //     if(stream){
    //         setVideoMuted(!videoMuted)
    //         stream.getVideoTracks()[0].enabled = videoMuted
    //     }
    // }


  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      height: '100vh',
    }}>
      {clients.map((clientID, index) => {
        return (
          <div key={clientID} style={videoLayout[index]} id={clientID}>
            <video
              width='100%'
              height='100%'
              ref={instance => {
                provideMediaRef(clientID, instance);
              }}
              autoPlay
              playsInline
              muted={clientID === LOCAL_VIDEO}
            />
              {/*<div className="callContainer">*/}
              {/*    <div className="controlsContainer flex">*/}
              {/*      {audioControl}*/}
              {/*      {videoControl}*/}
              {/*    </div>*/}
              {/*</div>*/}
          </div>
        );
      })}

    </div>
  );
}