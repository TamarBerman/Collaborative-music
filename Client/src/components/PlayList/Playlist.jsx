import { React, useEffect, useState, useContext } from "react";
import { useCookies } from "react-cookie";
import SongsList from "../SongsList/SongsList";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spin, Typography, Button, Menu, Modal, Divider } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { message } from "antd/lib";
import { playlistsContext } from "../../contexts/playlistsContext";
import NavigateToLogin from "../Login/NavigateToLogin";
import { userContext } from "../../contexts/userContext";
const { Title } = Typography;

const Playlist = () => {
  // שימוש בקונטקסט
  const { userPlaylist, setUserPlaylist, newPlaylistName, setNewPlaylistName } =
    useContext(playlistsContext);
    const { isLoggedIn } =
    useContext(userContext);
  const [cookies, setCookie, removeCookie] = useCookies(["access_token", "id"]);
  const loggedIn = !!cookies.access_token;
  const [playlistId, setPlaylistId] = useState("");
  const [loading, setLoading] = useState(true); // Add a loading state
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistLength, setPlaylistLength] = useState(0);
  const [myPlaylistName, setMyPlaylistName] = useState(newPlaylistName);
  // const [userPlaylist, setUserPlaylist] = useState([]);
  const baseURL = "http://localhost:3000/mp3";

  useEffect(() => {
    // כל רשימות השמעה של למשתמש זה
    // axios
    //   .get(`${baseURL}/getUserPlaylists`, {
    //     headers: {
    //       Authorization: `Bearer ${cookies.access_token}`,
    //     },
    //   })
    //   .then((response) => {
    //     // הוספת שם הרשימה לתפריט
    //     const userPlaylistItem = [];
    //     let i = 0;
    //     response.data.forEach((item) => {
    //       userPlaylistItem.push(getItem(++i, item));
    //     });
    //     userPlaylistItem.push(
    //       getItem(++i, { playlistId: 0, name: "New Playlist" })
    //     );
    //     setUserPlaylist(userPlaylistItem);
    //     setNewPlaylistName(`playList_${userPlaylistItem.length}`);
    //   })
    //   .catch((error) => {
    //     if (error.response?.status === 401) {
    //       removeCookie("access_token");
    //     }
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
    setLoading(false);
  }, []);

  // MODAL ליצירת פלייליסט
  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
    setMyPlaylistName(newPlaylistName);
  };
  const hideModal = () => {
    setNewPlaylistName(`playList_${userPlaylist.length}`);
    setMyPlaylistName(`playList_${userPlaylist.length}`);
    setOpen(false);
  };

  // PlayList menu
  // // יוצר אובייקטים להוספת רשימת הפלייליסטים לתפריט
  const getItem = (key, { playlistId, name }) => {
    const label = name;
    return {
      key,
      playlistId,
      label,
    };
  };

  // לחיצה על איבר בתפריט
  const handleMenuClick = (e) => {
    const clickedPlaylist = userPlaylist.find((item) => {
      return item.key == e.key;
    });
    if (clickedPlaylist) {
      setPlaylistId(clickedPlaylist.playlistId);
      // אם מה שנלחץ זה כפתור הוספת פלייליסט
      if (clickedPlaylist.playlistId == 0) {
        setShowPlaylist(false);
        // פתיחת טופס שיכניס שם של פלייליסט
        showModal();
      } else {
        // Check if the playlist length is already available in the state
        if (clickedPlaylist.playlistId !== playlistId) {
          // הצגת הפלייליסט שנלחץ
          setShowPlaylist(false);
          // כאן קריאת שרת לקבלת אורך רשימת השירים!
          // לשלוח רשימת השמעה
          axios
            .get(`${baseURL}/getPlaylistLength`, {
              headers: {
                Authorization: `Bearer ${cookies.access_token}`,
              },
              params: { playlistId: clickedPlaylist.playlistId },
            })
            .then((response) => {
              setPlaylistLength(response.data);
            })
            .catch((error) => {
              console.log(error);
            })
            .finally(() => {
              setShowPlaylist(true);
            });
        }
      }
    }
  };
  // Function to confirm and delete a playlist
  const handleDeletePlaylist = (playlistId, playlistName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the playlist "${playlistName}"?`
      )
    ) {
      axios
        .delete(`${baseURL}/deletePlaylist/${playlistId}`, {
          headers: {
            Authorization: `Bearer ${cookies.access_token}`,
          },
        })
        .then((response) => {
          // Update the userPlaylist after deleting
          setUserPlaylist((prevUserPlaylist) =>
            prevUserPlaylist.filter((item) => item.playlistId !== playlistId)
          );
        })
        .catch((error) => {
          console.error("Error deleting playlist:", error);
        });
    }
  };
  // Function to edit the playlist name
  const handleEditPlaylistName = (playlistId, currentName) => {
    console.log("in handleEditPlaylistName");
    const updatedName = prompt(
      "Enter the new name for the playlist:",
      currentName
    );
    if (updatedName !== null) {
      axios
        .put(
          `${baseURL}/updatePlaylistName/${playlistId}`,
          { newName: updatedName },
          {
            headers: {
              Authorization: `Bearer ${cookies.access_token}`,
            },
          }
        )
        .then((response) => {
          // Update the userPlaylist after editing the name
          setUserPlaylist((prevUserPlaylist) =>
            prevUserPlaylist.map((item) =>
              item.playlistId === playlistId
                ? { ...item, label: updatedName }
                : item
            )
          );
        })
        .catch((error) => {
          console.error("Error editing playlist name:", error);
        });
    }
  };

  // יצירת פלייליסט
  const createPlaylist = () => {
    axios
      .post(
        `${baseURL}/createPlaylist`,
        { newPlaylistName: myPlaylistName },
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
        setNewPlaylistName(`playList_${updatedUserPlaylist.length}`);
        setMyPlaylistName(`playList_${updatedUserPlaylist.length}`);
        setOpen(false);
      })
      .catch((error) => {
        if (error.response.status == 400)
          message.info("קיים פלייליסט עם שם זהה");
        else message.info("ארעה שגיאה במהלך יציאת הפלייליסט");
        showModal();
      })
      .finally(() => {});
  };
  const playlistcontainer = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  const customDividerStyle = {
    height: "10px", // Adjust the height to make it bigger
    backgroundColor: "#000", // Change the color to your preference
    border: "none", // Remove the default border
    fontSize: "24px", // Adjust the font size to make it bigger
    marginBottom: "20px",
    marginTop: "40px",
  };

  return (
    <>
      <Spin spinning={loading} tip="Loading" size="large">
        <Divider style={customDividerStyle}>Playlist</Divider>
        <>
          {loggedIn && !loading && (
            <div style={{ display: "flex", width: "100%" }}>
              <div
                style={{
                  width: "18%",
                  height: "74vh",
                  minHeight: "74vh",
                  maxHeight: "74vh",
                  overflowY: "auto",
                  position: "sticky",
                  top: 100,
                  background: "#001529",
                  marginRight: 20,
                }}
              >
                <Menu mode="inline" theme="dark" onClick={handleMenuClick}>
                  {userPlaylist.map((item) => (
                    <Menu.Item
                      key={item.key}
                      onClick={(e) => handleMenuClick(e, item)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {item.playlistId == 0 ? (
                          <>
                            <span style={{ fontWeight: "800px" }}>
                              {item.label}
                            </span>
                            <PlusOutlined />
                          </>
                        ) : (
                          <span>{item.label}</span>
                        )}

                        {item.playlistId !== 0 && (
                          <div>
                            <Button
                              style={{
                                border: "none",
                                background: "transparent",
                              }}
                              icon={<EditOutlined />}
                              onClick={() =>
                                handleEditPlaylistName(
                                  item.playlistId,
                                  item.label
                                )
                              }
                            />
                            <Button
                              style={{
                                border: "none",
                                background: "transparent",
                              }}
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleDeletePlaylist(
                                  item.playlistId,
                                  item.label
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </Menu.Item>
                  ))}
                  {/* Your menu items go here */}
                </Menu>
              </div>
              <div style={{ width: "82%" }}>
                {/* Song List */}
                {showPlaylist && (
                  <SongsList
                    // playlistLength={playlistLength}
                    playlistId={playlistId}
                    isPlaylistActive={true}
                  />
                )}
              </div>
            </div>
          )}
          {!loggedIn && (
            <>
              <div style={playlistcontainer}>
                <Title level={3} style={{ color: "gray" }}>
                  Hi, we are happy to see you are interest in our free
                  colabrative music site ☺️
                </Title>
                <Title level={3} style={{ color: "gray" }}>
                  We suggest to to <a href="/login">Login</a> /{" "}
                  <a href="/register">Register</a> here, to enjoy all uor
                  features
                </Title>
              </div>
              {/* <NavigateToLogin/> */}
            </>
          )}
        </>
      </Spin>
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
          value={myPlaylistName}
          onChange={(e) => setMyPlaylistName(e.target.value)}
        ></input>
      </Modal>
    </>
  );
};

export default Playlist;
