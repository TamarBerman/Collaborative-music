import { React, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import SongsList from "../SongsList/SongsList";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spin, Typography } from "antd";
const { Text, Title } = Typography;
// import "./Playlist.css";

const Playlist = () => {
  const [startSearch, setStartSearch] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["access_token", "id"]);
  const loggedIn = !!cookies.access_token;
  const [playlistSongIds, setPlaylistSongIds] = useState("");
  const [loading, setLoading] = useState(true); // Add a loading state

  const baseURL = "http://localhost:3000/mp3";
  const authURL = "http://localhost:3000/auth";

  const navigate = useNavigate();

  const navigateToLogin = () => {
    navigate("/login");
  };

  useEffect(() => {
    axios
      .get(`${baseURL}/userId`, {
        headers: {
          Authorization: `Bearer ${cookies.access_token}`,
        },
      })
      .then((response) => {
        setPlaylistSongIds(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
    // axios
    //   .get(`${baseURL}/getUsersPlaylists`, {
    //     headers: {
    //       Authorization: `Bearer ${cookies.access_token}`,
    //     },
    //   })
    //   .then((response) => {
    //     console.log("in getUsersPlaylists");

    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }, []); // Empty dependency array to run the effect only once on mount

  const playlistcontainer = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  return (
    <>
      <Spin spinning={loading} tip="Loading" size="large">
        <>
          {loggedIn && !loading && (
            <SongsList playlistNum={1} playlistSongIds={playlistSongIds} />
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
            </>
          )}
        </>
      </Spin>
    </>
  );
};

export default Playlist;
