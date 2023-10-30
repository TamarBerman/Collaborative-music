// npm install react-h5-audio-player
import {
  LikeOutlined,
  StarOutlined,
  LikeFilled,
  PlusOutlined,
  MinusOutlined,
  StarFilled,
  InfoCircleOutlined,
  DownloadOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { List, Button, Tooltip, Image, Layout, Menu, Modal } from "antd";
import axios from "axios";
import { useCookies } from "react-cookie";
import { React, useEffect, useState, useContext } from "react";
import { Typography, message } from "antd";
import "./Player.css";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { useLocation, useNavigate } from "react-router-dom";
import { playlistsContext } from "../../contexts/playlistsContext";

const baseUrl = "http://localhost:3000/mp3";
const reportsURL = "http://localhost:3000/abuse-reports";

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
  // שימוש בקונטקסט
  const { userPlaylist, setUserPlaylist, newPlaylistName, setNewPlaylistName } =
    useContext(playlistsContext);
  const [myNewPlaylistName, setMyNewPlaylistName] = useState(newPlaylistName);
  const { Title } = Typography;
  const { Text } = Typography;
  const { Header, Footer, Sider, Content } = Layout;
  const [likedSongs, setLikedSongs] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [addedToPlaylist, setAddedToPlaylist] = useState(false);
  const [existsPlaylist, setExistsPlaylist] = useState(null);
  const [showPlaylists, setShowPlaylists] = useState(false);

  const [songDetails, setSongDetails] = useState({
    song_name: "",
    song_description: "",
    song_rate: "",
    audio_url: "",
    image_url: "",
    song_id: "",
    like: 0,
    artists: [],
    album: "",
    duration: 0,
    title: "",
    genre: "",
    comment: "",
    year: 2023,
  });
  const [moreDetails, setMoreDetails] = useState(false);
  const { state } = useLocation(); // state all song details from songsList componnent (pressed song)
  const navigate = useNavigate();
  const accessToken = cookies.access_token || null;
  const songID = state.id;
  useEffect(() => {
    // קבלת רשימת שירים שהבנא הספציפי עשה עליהם לייק
    const likedSongsFromStorage = localStorage.getItem("LikedSongs") || [];
    if (likedSongsFromStorage != []) {
      setLikedSongs(JSON.parse(likedSongsFromStorage));
    }
    // Check if the current song is liked
    const isLiked = likedSongsFromStorage.includes(songID.toString());
    setIsLiked(isLiked);
    // קריאת שרת לבדוק האם השיר רשום בפלייליסט ולעדכן את הכפתור
    checkSongExists();
    // Make an API request to fetch the like count for the current song
    fetchLikeCount();
  }, []);

  // check Song Exists in the playlist (+/-) called in useWffect
  const checkSongExists = () => {
    // קריאת שרת לבדוק האם השיר רשום בפלייליסט ולעדכן את הכפתור
    axios
      .get(`${baseUrl}/checkSongExists/${state.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        // אם השיר קיים בפלייליסט- אחרת +י
        setAddedToPlaylist(response.data ? true : false);
        setExistsPlaylist(response.data || null);
      })
      .catch((error) => {
        handlePlaylistError(error, "connect");
      });
  };
  // when page refreshed - [updateLike...]
  //בגלל שהוא משתמש בסטייט - שזה המידע שנשלף הקריאה בעמוד רשימת שירים,, אז כשרפרשים את העמוד הזה
  //אין עוד קריאה לכן נראה את הערך הקודם לפני הוספת הלייק ורק אם נפנה לשיר שוב מרשימת השירים נראה את העידכון
  // לכן הפונקציה הזו קוראת קריאת שרת ביזסטטייט , ברגע שמתרנדר העמוד
  const fetchLikeCount = () => {
    // Make an API request to fetch the like count for the current song
    axios
      .get(`${baseUrl}/getLikeCount/${state.id}`)
      .then((response) => {
        setSongDetails({
          song_name: state.song_name,
          song_description: state.song_description,
          song_rate: state.rate,
          audio_url: state.audioUrl,
          image_url: state.imageUrl,
          song_id: state.id,
          like: response.data.likeCount || 0,
          artists: state.artists,
          album: state.album,
          duration: state.duration,
          title: state.title,
          genre: state.genre,
          comment: state.comment,
          year: state.year,
          description: state.description,
        });
      })
      .catch((error) => {
        console.log("Failed to fetch like count:", error);
        setSongDetails({
          song_name: state.song_name,
          song_description: state.song_description,
          song_rate: state.rate,
          audio_url: state.audioUrl,
          image_url: state.imageUrl,
          song_id: state.id,
          like: 1,
          artists: state.artists,
          album: state.album,
          duration: state.duration,
          title: state.title,
          genre: state.genre,
          comment: state.comment,
          year: state.year,
          description: state.description,
        });
      });
  };

  // handle errors with playlist
  const handlePlaylistError = (error, action) => {
    if (error.response.status === 401 && action != "connect") {
      if (!accessToken) message.warning("You need to first Login");
      else {
        message.warning("Token expired navigate to Login");
        removeCookie("access_token", { path: "/" });
        removeCookie("id", { path: "/" });
      }
      navigate("/login", { state: songDetails.song_id });
    } else {
      // Handle other errors
      if (action != "connect") message.error(`Error ${action}ing to playlist`);
    }
  };
  // add a song to user's playlist
  const addToPlayList = (playlistId) => {
    axios
      .put(
        `${baseUrl}/addToPlaylist`,
        { songId: songDetails.song_id, playlistId: playlistId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((response) => {
        console.log(response);
        setAddedToPlaylist(true);
        setExistsPlaylist({
          playlistId: response.data._id,
          name: response.data.name,
        });
        if (response.data.status == 409)
          message.warning("Song already exists in the playlist");
        else if (response.data.status == 404) message.warning("User not found");
        else {
          message.success(
            <>
              <span>This song had been addded successfully to </span>
              <span style={{ color: "green" }}>{response.data.name}</span>
            </>
          );
          setAddedToPlaylist(true);
        }
      })
      .catch((error) => {
        handlePlaylistError(error, "add");
      })
      .finally(() => {});
  };
  // remove from playlist
  const removeFromPlayList = () => {
    axios
      .put(
        `${baseUrl}/removeFromPlaylist`,
        { songId: songDetails.song_id, playlistId: existsPlaylist?.playlistId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((response) => {
        message.success(
          <>
            <span>This song had been removed successfully from </span>
            <span style={{ color: "green" }}>{response.data.name}</span>
          </>
        );
        setAddedToPlaylist(false);
      })
      .catch((error) => {
        handlePlaylistError(error, "remove");
      });
  };

  // add like
  const addLike = () => {
    axios
      .put(`${baseUrl}/addlike`, { song_id: songDetails.song_id })
      .then((res) => {
        setSongDetails({ ...songDetails, like: songDetails.like + 1 });
        setIsLiked(true);
        // add song to localstorage to
        const newLikedSongs = [...likedSongs, songDetails.song_id];
        setLikedSongs(newLikedSongs);
        localStorage.setItem("LikedSongs", JSON.stringify(newLikedSongs));
      })
      .catch((err) => console.log(err));
  };
  // remove like
  const removeLike = () => {
    axios
      .put(`${baseUrl}/removelike`, { song_id: songDetails.song_id })
      .then((res) => {
        setSongDetails({ ...songDetails, like: songDetails.like - 1 });
        setIsLiked(false);
        // remove song from localstorage
        const newLikedSongs = likedSongs.filter(
          (songid) => songid !== songDetails.song_id
        );
        setLikedSongs(newLikedSongs);
        localStorage.setItem("LikedSongs", JSON.stringify(newLikedSongs));
      })
      .catch((err) => console.log(err));
  };

  // download
  const handleDownload = () => {
    // Create a temporary anchor element
    const downloadLink = document.createElement("a");
    downloadLink.href = songDetails.audio_url;
    downloadLink.download = `${songDetails.song_name}.mp3`; // Set the default download filename
    document.body.appendChild(downloadLink);
    downloadLink.click(); // Simulate a click on the link to initiate the download
    document.body.removeChild(downloadLink); // Clean up the temporary element
  };

  // ReportAbuse דיווח על שימוש לרעה
  const handleReportAbuse = () => {
    axios
      .post(
        `${reportsURL}/create`,
        { details: { songId: songDetails.song_id } },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((response) => {
        message.success(
          <div>
            תודה על תגובתך
            <br />
            הדיווח נרשם בהצלחה ויעבור לטיפול
          </div>
        );
      })
      .catch((error) => {
        message.error(
          <div>
            מצטערים, הדיווח לא נשלח
            <br />
            {error.message}
          </div>
        );
      });
  };

  const showMoreDetails = () => {
    if (moreDetails) setMoreDetails(false);
    else setMoreDetails(true);
  };

  // MODAL ליצירת פלייליסט
  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
  };
  const hideModal = () => {
    setNewPlaylistName(`playList_${userPlaylist.length}`);
    setMyNewPlaylistName(`playList_${userPlaylist.length}`);
    setOpen(false);
  };
  // לחיצה על הוספה לפליליסט
  const handleAddToPlaylistClick = (e) => {
    const clickedPlaylist = userPlaylist.find((item) => {
      return item.key == e.key;
    });
    if (clickedPlaylist) {
      // אם מה שנלחץ זה כפתור הוספת פלייליסט
      if (clickedPlaylist.playlistId == 0) {
        // פתיחת טופס שיכניס שם של פלייליסט
        showModal();
      } else {
        console.log("In ELSE - PLAYLIST ADD");
        addToPlayList(clickedPlaylist.playlistId);
      }
      setShowPlaylists(false);
    }
  };
  // יצירת פלייליסט
  const createPlaylist = () => {
    axios
      .post(
        `${baseUrl}/createPlaylist`,
        { newPlaylistName: myNewPlaylistName },
        {
          headers: {
            Authorization: `Bearer ${cookies.access_token}`,
          },
        }
      )
      .then((response) => {
        // כאן נקבל חזרה אוביקט של
        // ונציב ב userPlaylist
        let updatedUserPlaylist = userPlaylist.slice(0, -1);
        console.log(response);
        // Add the response data to the copied userPlaylist
        updatedUserPlaylist.push({
          key: userPlaylist.length + 1, // Adjust the key accordingly
          playlistId: response.data._id,
          label: response.data.name,
        });
        // Re-add the last item
        updatedUserPlaylist.push(userPlaylist[userPlaylist.length - 1]);
        // Update userPlaylist with the modified array
        setUserPlaylist(updatedUserPlaylist);
        addToPlayList(response.data._id);
        hideModal();
      })
      .catch((error) => {
        if (error.response.status == 400)
          message.info("קיים פלייליסט עם שם זהה");
        else message.info("ארעה שגיאה במהלך יציאת הפלייליסט");
        showModal();
      })
      .finally(() => {});
  };
  const starArray = generateStarArray(songDetails.song_rate);

  const headerStyle = {
    textAlign: "left",
    height: 100,
    paddingInline: 50,
    backgroundColor: "black",
  };
  const contentStyle = {
    textAlign: "left",
    // minHeight: 120,
    // lineHeight: "10px",
    paddingInline: 50,
    backgroundColor: "black",
    maxHeight: "130px",
  };
  const siderStyle = {
    backgroundColor: "black",
    width: "300px",
    // height: "300px",

    flex: "0 0 300px", // This ensures a fixed width of 300px
  };
  const footerStyle = {
    textAlign: "left",
    backgroundColor: "black",
    paddingInline: 50,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 70,
    maxHeight: 70,
  };
  const buttonStyle = {
    background: "none",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    boxShadow: "none",
    outline: "none",
    paddingLeft: 0,
    color: "#5B80FC",
  };
  const listContainerStyle = {
    overflowY: "auto",
    maxHeight: "100px", // Adjust the max height as needed
  };
  return (
    <>
      <Layout
        style={{
          bottom: 120,
          left: "7.5%",
          width: "100%",
          position: "fixed",
          backgroundColor: "black",
        }}
      >
        <Sider style={siderStyle} width={300}>
          <div
            style={{
              width: 300, // Adjust this width to your desired width
              // height: 200, // Adjust this height to your desired height
              // overflow: "hidden",
            }}
          >
            <Image
              style={
                {
                  // clip: "rect(100px, 400px, 400px, 100px)", // Adjust the values as needed
                  // width: 400, // Make sure it matches the width of the containing div
                  // height: 300, // Make sure it matches the height of the containing div
                }
              }
              src={songDetails.image_url}
              preview={{
                src: songDetails.image_url,
              }}
            />
          </div>
        </Sider>
        <Layout>
          <Header style={headerStyle}>
            <List style={{ display: "inline", lineHeight: 1 }}>
              <List.Item style={{ display: "inline", lineHeight: 0.1 }}>
                <Title
                  level={2}
                  style={{
                    lineHeight: 0.2,
                    marginTop: "5px",
                    fontSize: "200%",
                  }}
                >
                  {songDetails.title}
                </Title>
              </List.Item>
              <br />
              <List.Item style={{ display: "inline", paddingTop: "1px" }}>
                {songDetails.artists[0] && (
                  <span>
                    {" "}
                    {songDetails.artists.map((artist) => artist).join(", ")}
                  </span>
                )}
              </List.Item>
              <br />
              <List.Item style={{ display: "inline" }}>
                <span key="star-icons">
                  {/* Map over the starArray and render stars */}
                  {starArray.map((star, index) => (
                    <StarIcon key={`star-${index}`} type={star} />
                  ))}
                </span>
              </List.Item>
            </List>
          </Header>

          <Content style={contentStyle}>
            <Button style={buttonStyle} onClick={showMoreDetails}>
              {moreDetails ? (
                <>
                  <span style={{}}>Less Dtails</span>
                  <UpOutlined style={{ marginLeft: "10px" }} />
                </>
              ) : (
                <>
                  <span style={{}}>More Dtails</span>
                  <DownOutlined style={{ marginLeft: "10px" }} />
                </>
              )}
            </Button>

            {moreDetails ? (
              <List style={listContainerStyle}>
                <List.Item style={{ display: "inline", fontSize: "80%" }}>
                  {<span>album: {songDetails.album}</span>}
                </List.Item>
                <br />
                <List.Item style={{ display: "inline", fontSize: "80%" }}>
                  {<span>description: {songDetails.description}</span>}
                </List.Item>
                <br />
                <List.Item style={{ display: "inline", fontSize: "80%" }}>
                  {<span>year: {songDetails.year}</span>}
                </List.Item>
                <br />
                <List.Item style={{ display: "inline", fontSize: "80%" }}>
                  {<span>genre: {songDetails.genre}</span>}
                </List.Item>
                <br />
                <List.Item style={{ display: "inline", fontSize: "80%" }}>
                  {
                    <span>
                      duration: {(songDetails.duration / 60).toFixed(2)} min.
                    </span>
                  }
                </List.Item>
                <br />
                <List.Item style={{ display: "inline", fontSize: "80%" }}>
                  <span>
                    comments:{" "}
                    {songDetails.comment.map((comment) => comment).join(", ")}
                  </span>
                </List.Item>
                <br />

                {/* <List.Item style={{ display: "inline" }}>
                  {<span>album: {songDetails}</span>}
                </List.Item> */}
              </List>
            ) : null}
          </Content>
          <Footer style={footerStyle}>
            <List
              style={
                {
                  // bottom: 100,
                  // marginTop: 0,
                  // left: 0,
                  // width: "80%",
                  // position: "fixed",
                }
              }
            >
              <List.Item style={{ display: "inline-block" }}>
                <Tooltip title="Like">
                  <Button
                    type="primary"
                    shape="round"
                    icon={
                      isLiked ? (
                        <LikeFilled
                          style={{
                            strokeWidth: "20",
                            stroke: "white",
                            paddingRight: "5px",
                          }}
                        />
                      ) : (
                        <LikeOutlined
                          style={{
                            strokeWidth: "20",
                            stroke: "white",
                            paddingRight: "5px",
                          }}
                        />
                      )
                    }
                    size={"large"}
                    onClick={!isLiked ? addLike : removeLike}
                    style={{
                      backgroundColor: "black",
                      borderColor: "grey",
                      fontWeight: "bold",
                    }}
                  >
                    {songDetails.like}
                  </Button>
                </Tooltip>
              </List.Item>
              <List.Item style={{ display: "inline-block", margin: "0 10px" }}>
                {!addedToPlaylist && (
                  <Tooltip
                    title={
                      <>
                        {showPlaylists && (
                          <>
                            <Menu
                              mode="inline"
                              theme="dark"
                              items={userPlaylist}
                              onClick={handleAddToPlaylistClick}
                            />
                          </>
                        )}
                        {!showPlaylists && (
                          <span>Click to add to Playlist</span>
                        )}
                      </>
                    }
                  >
                    <Button
                      type="primary"
                      shape="round"
                      icon={
                        <PlusOutlined
                          style={{
                            strokeWidth: "60",
                            stroke: "white",
                          }}
                        />
                      }
                      onClick={() => {
                        setShowPlaylists(!showPlaylists);
                      }}
                      size={"large"}
                      style={{
                        backgroundColor: "black",
                        borderColor: "grey",
                        fontWeight: "bold",
                      }}
                    />
                  </Tooltip>
                )}

                {addedToPlaylist && (
                  <Tooltip
                    title={
                      <>
                        <span>Remove from: </span>
                        <span style={{ color: "tan" }}>
                          {existsPlaylist?.name}
                        </span>
                      </>
                    }
                  >
                    <Button
                      type="primary"
                      shape="round"
                      icon={
                        <MinusOutlined
                          style={{
                            strokeWidth: "60",
                            stroke: "white",
                          }}
                        />
                      }
                      onClick={removeFromPlayList}
                      size={"large"}
                      style={{
                        backgroundColor: "black",
                        borderColor: "grey",
                        fontWeight: "bold",
                      }}
                    ></Button>
                  </Tooltip>
                )}
              </List.Item>
              <List.Item style={{ display: "inline-block", margin: "0 10px" }}>
                <Tooltip title="Download">
                  <Button
                    type="primary"
                    shape="round"
                    icon={
                      <DownloadOutlined
                        style={{
                          strokeWidth: "60",
                          stroke: "white",
                        }}
                      />
                    }
                    size={"large"}
                    onClick={handleDownload}
                    style={{
                      backgroundColor: "black",
                      borderColor: "grey",
                      fontWeight: "bold",
                    }}
                  >
                    {"Download"}
                  </Button>
                </Tooltip>
              </List.Item>

              <List.Item style={{ display: "inline-block", margin: "0 10px" }}>
                <Tooltip title="Report">
                  <Button
                    type="primary"
                    shape="round"
                    icon={<InfoCircleOutlined />}
                    size={"large"}
                    onClick={handleReportAbuse}
                    style={{
                      backgroundColor: "black",
                      border: "none",
                      color: "red",
                    }}
                  >
                    {"דיווח על תוכן לא ראוי"}
                  </Button>
                </Tooltip>
              </List.Item>
            </List>
          </Footer>
        </Layout>
      </Layout>

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
      {/* מודל הוספת פלייליסט */}
      <Modal
        title="Modal"
        open={open}
        onOk={createPlaylist}
        onCancel={hideModal}
        okText="Add"
        cancelText="Cancle"
      >
        <input
          // value={newPlaylistName}
          value={myNewPlaylistName}
          // onChange={(e) => setNewPlaylistName(e.target.value)}
          onChange={(e) => setMyNewPlaylistName(e.target.value)}
        ></input>
      </Modal>
    </>
  );
};

export default Player;
