import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Login/Register";
import Profile from "./components/Login/Profile";
import NavBar from "./components/NavBar";
import Home from "./components/Home";
import FileUpload from "./components/Uplaod/FileUpload";
import Error404 from "./components/Error404";
import Player from "./components/Player/Player";
import About from "./components/About";
import SongsList from "./components/SongsList/SongsList";
import Playlist from "./components/PlayList/Playlist";
import { useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import PageHeader from "./components/PageHeader";
import "./antd-custom.css";
import "./App.css";
import ManageSongs from "./components/Manager/ManageSongs";

const App = () => {
  // Dark mode
  const [darkMode, setDarkMode] = useState(true);
  return (
    <>
      {/* <ThemeProvider theme={darkTheme}> */}
      {/* <CssBaseline /> */}
      {/* </ThemeProvider> */}
      <div
        style={{
          background: darkMode ? "black" : "white",
          // height: "calc(100vh - 40px)",
          // padding: "20px",
        }}
      >
        <ConfigProvider
          theme={{
            algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          }}
        >
          <NavBar />
          {/* <PageHeader  /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/upload"
              element={<FileUpload />}
              componentName="Upload"
            />
            <Route path="/music/:song" element={<Player />} />
            <Route path="/playlist/:song" element={<Player />} />
            <Route path="/about" element={<About />} />
            <Route path="/music" element={<SongsList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/playlist" element={<Playlist />} />


            <Route path="/manageSongs" element={<ManageSongs />} />

            <Route path="*" element={<Error404 />} />
          </Routes>
        </ConfigProvider>
      </div>
    </>
  );
};

export default App;
