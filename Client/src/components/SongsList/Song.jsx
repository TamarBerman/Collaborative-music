// לא מתחלף אם לוחצים על אחר

import { Card, Row, notification, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  PlayCircleOutlined,
  DoubleLeftOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import AudioPlayer from "react-h5-audio-player";

const { Meta } = Card;
const Song = ({
  songDetails,
  callComponent,
  setMiniAudioPlayer,
  isSongPlaying,
}) => {
  const song = songDetails;
  const navigate = useNavigate();

  useEffect(() => {}, []);
  const navigateToPlayer = () => {
    console.log("in navigateToPlayer");
    navigate(`/${callComponent}/${song.id}`, { state: song });
  };

  // האזנה לשיר
  const [api, contextHolder] = notification.useNotification();
  // const openNotification = (placement) => {

  //   // const audioPlayer = (
  //   //   <AudioPlayer
  //   //     src={song.audioUrl}
  //   //     autoPlay
  //   //     controls
  //   //     volume={0.6}
  //   //     loop={false}
  //   //   />
  //   // );

  //   // api.open({
  //   //   message: ` ${song.title}`,
  //   //   description: audioPlayer,
  //   //   duration: 0,
  //   //   placement,
  //   // });
  // };
  // openNotification("bottomRight");

  const playSong = () => {
    setMiniAudioPlayer({
      visible: true,
      name: song.title,
      audioUrl: song.audioUrl,
      id: song.id,
    });
    console.log(song);
  };

  return (
    <>
      {/* <Row justify="center">
  <Card
    hoverable
    style={{
      width: 240,
      margin: "auto",
      position: "relative",
      overflow: "hidden", // Hide any content that overflows the card
    }}
    cover={
      <div
        onClick={playSong}
        style={{
          backgroundImage: `url(${song.imageUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center", // Center the image
          width: "100%",
          height: "200px",
          objectFit: "cover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: 1, // Set initial opacity for the image
          transition: "opacity 0.3s ease", // Add a smooth transition for the image opacity
        }}
        onMouseEnter={(e) => (e.target.style.opacity = 0)} // Clear the image on hover
        onMouseLeave={(e) => (e.target.style.opacity = 0.4)} // Set the initial opacity on mouse leave
      >
        <div // Add a div for the overlay
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "200px",
            background: "rgba(0, 0, 0, 0.7)", // Black background with opacity
            color: "#fff", // Text color
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.4, // Hide the overlay initially
            transition: "opacity 0.3s ease", // Add a smooth transition for the overlay
          }}
        ></div>
        <div>
          {isSongPlaying.songId == song.id && isSongPlaying.playing ? (
            <PauseCircleOutlined style={{ fontSize: "400%", color: "red" }} />
          ) : (
            <PlayCircleOutlined style={{ fontSize: "400%" , color:"white"}} />
          )}
        </div>
      </div>
    }
  >
    <Meta
      onClick={navigateToPlayer}
      title={
        <>
          <DoubleLeftOutlined /> {song.song_name}
        </>
      }
    />
  </Card>
</Row> */}

      {/* {contextHolder} */}
      <Row justify="center">
        <Card
          hoverable
          style={{
            width: 240,
            margin: "auto",
            position: "relative",
            overflow: "hidden", // Hide any content that overflows the card
          }}
          cover={
            <div // Use a div for the cover instead of img
              onClick={playSong}
              style={{
                backgroundImage: `url(${song.imageUrl})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center", // Center the image
                width: "100%",
                height: "200px",
                objectFit: "cover",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div // Add a div for the overlay
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "200px",
                  background: "rgba(0, 0, 0, 0.7)", // Black background with opacity
                  color: "#fff", // Text color
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: 0, // Hide the overlay initially
                  transition: "opacity 0.3s ease", // Add a smooth transition
                }}
                onMouseEnter={(e) => (e.target.style.opacity = 0.4)} // Show overlay on hover
                onMouseLeave={(e) => (e.target.style.opacity = 0)} // Hide overlay on mouse leave
              ></div>
              <div>
                {isSongPlaying.songId == song.id && isSongPlaying.playing ? (
                  <PauseCircleOutlined
                    style={{ fontSize: "350%", color: "red" }}
                  />
                ) : (
                  <PlayCircleOutlined style={{ fontSize: "350%" }} />
                )}
              </div>
            </div>
          }
        >
          <Meta
            onClick={navigateToPlayer}
            title={
              <>
                <Tooltip title={song.song_name}>
                  <DoubleLeftOutlined />
                {" "}
                {song.song_name}</Tooltip>
              </>
            }
          />
        </Card>
      </Row>
    </>
  );
};

export default Song;

// פתוחים אחד אחרי השני
// import { Card, Row, notification } from "antd";
// import { useNavigate } from "react-router-dom";
// import React, { useState } from "react";
// import { PlayCircleOutlined, DoubleLeftOutlined } from "@ant-design/icons";
// import AudioPlayer from "react-h5-audio-player";

// const { Meta } = Card;
// const Song = (props) => {
//   const song = songDetails;
//   const navigate = useNavigate();
//   const [isNotificationVisible, setNotificationVisible] = useState(false);

//   const navigateToPlayer = () => {
//     console.log("in navigateToPlayer");
//     navigate(`/${callComponent}/${song.id}`, { state: song });
//   };

//   // האזנה לשיר
//   const openNotification = (placement) => {
//     if (isNotificationVisible) {
//       // Close the existing notification
//       setNotificationVisible(false);
//     }

//     const audioPlayer = (
//       <AudioPlayer src={song.audioUrl} autoPlay controls volume={0.6} loop={false} />
//     );

//     notification.open({
//       message: ` ${song.title}`,
//       description: audioPlayer,
//       duration: 0,
//       placement,
//       onClose: () => setNotificationVisible(false),
//     });

//     // Set the notificationVisible state to true to indicate a notification is open
//     setNotificationVisible(true);
//   };

//   const playSong = () => {
//     console.log(song);
//     openNotification('bottomRight');
//   };

//   return (
//     <Row justify="center">
//       <Card
//         hoverable
//         style={{
//           width: 240,
//           margin: "auto",
//           position: "relative",
//           overflow: "hidden",
//         }}
//         cover={
//           <div
//             onClick={playSong}
//             style={{
//               backgroundImage: `url(${song.imageUrl})`,
//               backgroundSize: "cover",
//               backgroundRepeat: "no-repeat",
//               backgroundPosition: "center",
//               width: "100%",
//               height: "200px",
//               objectFit: "cover",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 height: "200px",
//                 background: "rgba(0, 0, 0, 0.7)",
//                 color: "#fff",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 opacity: 0,
//                 transition: "opacity 0.3s ease",
//               }}
//               onMouseEnter={(e) => (e.target.style.opacity = 1)}
//               onMouseLeave={(e) => (e.target.style.opacity = 0)}
//             >
//               <div>
//                 <PlayCircleOutlined style={{ fontSize: "400%" }} />
//               </div>
//             </div>
//           </div>
//         }
//       >
//         <Meta
//           onClick={navigateToPlayer}
//           title={
//             <>
//               <DoubleLeftOutlined /> {song.song_name}
//             </>
//           }
//         />
//       </Card>
//     </Row>
//   );
// };

// export default Song;
