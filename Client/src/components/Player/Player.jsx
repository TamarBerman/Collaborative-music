import React from "react";
import { useEffect, useState } from "react";
import { Typography, message } from "antd";
import "./Player.css";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { useLocation, useNavigate } from "react-router-dom";
const baseUrl = "http://localhost:3000/mp3";
// npm install react-h5-audio-player
import {
  LikeOutlined,
  StarOutlined,
  VerticalAlignBottomOutlined,
  PlusOutlined,
  MinusOutlined,
  StarFilled,
  // StarHalfOutlined,
} from "@ant-design/icons";
import { List, Space } from "antd";
import axios from "axios";
import { useCookies } from "react-cookie";

// rate
const generateStarArray = (rate) => {
  const filledStars = Math.floor(rate); // Number of filled stars
  const hasHalfStar = rate % 1 >= 0.1; // Check if there is a half-filled star
  const starArray = new Array(5).fill(0).map((_, index) => {
    if (index < filledStars) {
      return "filled";
    } else if (index === filledStars && hasHalfStar) {
      return "half-filled";
    } else {
      return "empty";
    }
  });
  return starArray;
};
const starStyle = { fontSize: "16px", color: "#fadb14" };
const StarIcon = ({ type }) => {
  if (type === "filled") {
    return <StarFilled style={starStyle} />;
  } else if (type === "half-filled") {
    // return <StarHalfOutlined />;
    return (
      <span style={starStyle}>
        <StarFilled />
        <StarOutlined />
      </span>
    );
  } else {
    return <StarOutlined style={starStyle} />;
  }
};
const Player = () => {
  const { Title } = Typography;
  const { Text } = Typography;
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [addedToPlaylist, setAddedToPlaylist] = useState(false);
  const [songDetails, setSongDetails] = useState({
    song_name: "",
    song_description: "",
    song_rate: "",
    audio_url: "",
    image_url: "",
    id: "",
  });
  const accessToken = cookies.access_token || null;
  const navigate = useNavigate();
  // state all song details from songsList componnent (pressed song)
  const { state } = useLocation();

  useEffect(() => {
    setSongDetails({
      song_name: state.song_name,
      song_description: state.song_description,
      song_rate: state.rate,
      audio_url: state.audioUrl,
      image_url: state.imageUrl,
      id: state.id,
    });
  }, []);

  const starArray = generateStarArray(songDetails.song_rate);

  const IconText = ({ icon, text }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  );

  // add a song to user's playlist
  const addToPlayList = () => {
    axios
      .put(
        `${baseUrl}/addToPlaylist`,
        { songId: songDetails.id },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((response) => {
        console.log("response", response);
        if (response.data.status == 409)
          message.warning("Song already exists in the playlist");
        else if (response.data.status == 404) message.warning("User not found");
        else {
          message.success(
            "This song had been addded successfully to your own playlist"
          );
          setAddedToPlaylist(true);
        }
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response.status === 401) {
          if (!accessToken) message.warning("You need to first Login");
          else {
            message.warning("Token expired navigate to Login");
            removeCookie("access_token", { path: "/" });
            removeCookie("id", { path: "/" });
          }
          navigate("/login", { state: songDetails.id });
        } else {
          // Handle other errors
          message.error("Error adding to playlist");
        }
      });
  };

  const removeFromPlayList = () => {
    axios
      .put(
        `${baseUrl}/removeFromPlaylist`,
        { songId: songDetails.id },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then(() => {
        message.success("This song has been removed from your playlist");
        setAddedToPlaylist(false);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          if (!accessToken) message.error("You need to first Login");
          else {
            message.error("Token expired navigate to Login");
            removeCookie("access_token", { path: "/" });
            removeCookie("id", { path: "/" });
          }
          navigate("/login", { state: songDetails.id });
        } else {
          message.error("Error removing this song to plaaylist");
        }
      });
  };

  const handleDownload = () => {
    // Create a temporary anchor element
    const downloadLink = document.createElement("a");
    downloadLink.href = songDetails.audio_url;
    downloadLink.download = "song.mp3"; // Set the default download filename
    document.body.appendChild(downloadLink);
    downloadLink.click(); // Simulate a click on the link to initiate the download
    document.body.removeChild(downloadLink); // Clean up the temporary element
  };
  return (
    <>
      <List
        // style={{ position: "fixed" , bottom: 100}}
        itemLayout="vertical"
        size="large"
        dataSource={[songDetails]}
        renderItem={(songDetails) => (
          <List.Item
            key={songDetails.song_name}
            actions={[
              // <IconText
              //   icon={StarOutlined}
              //   text={songDetails.song_rate}
              //   key="list-vertical-star-o"
              // />,
              <span key="star-icons">
                {/* Map over the starArray and render stars */}
                {starArray.map((star, index) => (
                  <StarIcon key={`star-${index}`} type={star} />
                ))}
              </span>,
              addedToPlaylist ? (
                <button
                  key="button-list-vertical-play-list"
                  onClick={removeFromPlayList}
                  className="button"
                >
                  <IconText
                    icon={MinusOutlined}
                    text="Remove from Playlist"
                    key="list-vertical-play-list"
                  />
                </button>
              ) : (
                <button
                  key="button-list-vertical-play-list"
                  onClick={addToPlayList}
                  className="button"
                >
                  <IconText
                    icon={PlusOutlined}
                    text="Add to Playlist"
                    key="list-vertical-play-list"
                  />
                </button>
              ),
              <button
                key="button-list-vertical-download"
                onClick={handleDownload}
                className="button"
              >
                <IconText
                  icon={VerticalAlignBottomOutlined}
                  text="Download"
                  key="download"
                />
              </button>,
            ]}
            extra={<img width={272} alt="logo" src={songDetails.image_url} />}
          >
            {/* <Tag color="green" key={"preset"}>
              {"private"}
            </Tag> */}
            <List.Item.Meta
              title={<a>{songDetails.song_name}</a>}
              description={songDetails.song_description}
            />

            {songDetails.song_description}
          </List.Item>
        )}
      />
      <div
        style={{
          textAlign: "center",
          bottom: 0,
          marginTop: 20,
          width: "100%",
          position: "fixed",
        }}
      >
        <AudioPlayer
          src={songDetails.audio_url}
          autoPlay
          controls
          volume={0.6}
          loop={false}
        />
      </div>
    </>
  );
};

export default Player;

// download

// const handleDownload = () => {
//   axios.get(`${baseUrl}/download/${songDetails.id}`, )
//     .then((response) => {
//       // Create a blob from the response data
//       const blob = new Blob([response.data], { type: "audio/mpeg" });

//       // Create a URL for the blob
//       const url = window.URL.createObjectURL(blob);

//       // Create a temporary link and click it to trigger the download
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `song_${songDetails.song_name}.mp3`);
//       document.body.appendChild(link);
//       link.click();

//       // Clean up the URL object after download
//       URL.revokeObjectURL(url);
//     })
//     .catch((error) => {
//       console.error("Error downloading song:", error);
//       // Handle error here (e.g., show an error message to the user)
//     });
// };

// const fetchAudio = async (song_Id) => {
//   // if (isInitialRender) {
//   // setIsInitialRender(false);
//   try {
//     const response = await axios.post(
//       "http://localhost:3000/mp3/fetch",
//       { fileId: song_Id },
//       {
//         headers: {
//           "content-type": "application/json",
//         },
//       }
//     );
//     const { imageUrl, audioUrl, song_name, song_description } =
//       response.data;
//     setImageUrl(imageUrl);
//     setAudioUrl(audioUrl);
//     setSongName(song_name);
//     setSongDescription(song_description);
//   } catch (error) {
//     // console.error("Error fetching audio:", error);
//     console.log("Error fetching audio:---------");
//   }
//   // }
// };
// fetchAudio("64a3fa4ebfafa2b2d4f96e3d");

{
  /* <Row justify="center" align="middle"> */
}
{
  /* <Col xs={24} sm={24} md={16} lg={12} xl={8}> */
}
{
  /* <Title level={2}>{songName}</Title>
          <Text strong>{songDescription}</Text>
          <img
            className="musicCover"
            src={imageUrl}
            alt="Music Cover"
            style={{ width: "80%" }}
          /> */
}
{
  /* </Col> */
}
{
  /* </Row> */
}
