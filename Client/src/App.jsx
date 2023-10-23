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
import ManageUsers from "./components/Manager/ManageUsers";
import AdminLayout from "./components/AdminLayout";
import AdminPage from "./components/Manager/AdminPage";

import he_IL from 'antd/es/locale/he_IL';


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
        locale={he_IL}
          theme={{
            algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              // fontFamily: 'ChilankaRegular',
              fontFamily: 'NunitoVariableFont_wght',

              fontSize:"19px",
            }
          }}
        >
          <Routes>
            <Route path="/" element={<NavBar><Home /></NavBar>}/>
            <Route path="/login" element={<NavBar><Login /></NavBar>} />
            <Route path="/register" element={<NavBar><Register /></NavBar>} /> 
            <Route path="/home" element={<NavBar><Home /></NavBar>} />
            <Route path="/upload" element={<NavBar><FileUpload /></NavBar>}/>
            <Route path="/music/:song" element={<NavBar><Player /></NavBar>} />
            <Route path="/playlist/:song" element={<NavBar><Player /></NavBar>} />
            <Route path="/about" element={<NavBar><About /></NavBar>} />
            <Route path="/music" element={<NavBar><SongsList /></NavBar>} />
            <Route path="/profile" element={<NavBar><Profile /></NavBar>} />
            <Route path="/playlist" element={<NavBar><Playlist /></NavBar>} />

            <Route path="/admin1/manageSongs" element={<AdminLayout><ManageSongs /></AdminLayout>} />
            <Route path="/admin1/manageUsers" element={<AdminLayout><ManageUsers /></AdminLayout>} />
            <Route path="/admin1" element={<AdminLayout><AdminPage/></AdminLayout>} />
            <Route path="/admin1/*" element={<AdminLayout><AdminPage/></AdminLayout>} />

            <Route path="*" element={<Error404 />} />
          </Routes>
        </ConfigProvider>
      </div>
    </>
  );
};

export default App;