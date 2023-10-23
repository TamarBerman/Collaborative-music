import React from "react";

const AudioPlayer = (props) => {
    console.log("props.song")

    console.log(props.song)
  return <>
  <div>
    <AudioPlayer
          src={props.song.audioUrl}
          autoPlay
          controls
          volume={0.6}
          loop={false}
        />
  </div>
  
  
  </>;
};

export default AudioPlayer;
