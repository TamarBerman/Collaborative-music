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
  const [userId, setUserId] = useState("");
  const [songsId, setSongsId] = useState("");
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
        setSongsId(response.data);
        setLoading(false); // Set loading to false once data fetching is complete
      })
      .catch((error) => {
        console.log(error);
        setLoading(false); // Set loading to false on error as well
      });
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
            <SongsList userId={"userId"} songsIds={songsId} />
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
