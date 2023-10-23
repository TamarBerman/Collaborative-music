import React, {  useState} from "react";
import AudioPlayer from "react-h5-audio-player";

const MiniPlayer = ({ audioUrl, name ,songId, setIsSongPlaying}) => {
  // const [isPlaying, setIsPlaying] = useState(true); // Initial state is playing
  console.log("songId");
  console.log(songId);

  return (
    <>
      <div style={{ borderTop: "10px solid grey", paddingTop: "10px" }}>
        <p style={{ margin: 0 }}>{name}</p>
        <AudioPlayer
          src={audioUrl}
          autoPlay
          controls
          volume={0.6}
          loop={false}
          style={{ backgroundColor: "white !important" }}
          onPlay={() => setIsSongPlaying({songId:songId, playing: true})}
          onPause={() => setIsSongPlaying({songId:songId, playing: false})}
        />
      </div>
    </>
  );
};
export default MiniPlayer;
