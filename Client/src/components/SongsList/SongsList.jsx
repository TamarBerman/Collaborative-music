import { List, Typography, Col, Divider, Spin, Row } from "antd";
import Song from "./Song";
import { useState, useEffect } from "react";
import axios from "axios";
import Filter from "./Filter";
import { useCookies } from "react-cookie";
import MiniPlayer from "../Player/MiniPlayer";
import Sort from "./Sort";

const pageSize = 8; // Number of elements to display per page

const SongsList = (props) => {
  const baseUrl = "http://localhost:3000/mp3";
  let propVal = !props.search && !props.userId ? null : props;
  let searchValue = props.search || null;
  let isPlaylistActive = props.isPlaylistActive || null;
  let playlistId = props.playlistId || null;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [length, setLength] = useState(pageSize);
  const [filteredData, setFilteredData] = useState([]);
  const [sort, setSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [cookies] = useCookies(["access_token"]);
  const accessToken = cookies.access_token || null;
  const callComponent = isPlaylistActive ? "playlist" : "music";

  // השמעת שיר זמני
  const [miniAudioPlayer, setMiniAudioPlayer] = useState({
    visible: false,
    name: "",
    audioUrl: "",
    id: "",
  });

  useEffect(() => {
    console.log("miniAudioPlayer");
    console.log(miniAudioPlayer);
  }, [miniAudioPlayer]);

  const [isSongPlaying, setIsSongPlaying] = useState({
    songId: "",
    playing: false,
  });

  useEffect(() => {
    console.log("isSongPlaying");
    console.log(isSongPlaying);
  }, [isSongPlaying]);

  // כאשר מופעל הסינון עידכון ערכי הסינון וקריאה
  useEffect(() => {
    playlistId = props.playlistId || null;
    setCurrentPage(1);
    fetchData(1, filteredData, sort);
  }, [filteredData, sort]);

  // כאשר מתרנדר העמוד- בדיקת אורך לעדכון pagination
  useEffect(() => {
    const getLength = async () => {
      try {
        let response;
        // אם נשמצא ברשימת שירים
        if (!propVal) {
          return;
          //   response = await axios.get(`${baseUrl}/len`);
        }
        // אם נמצא בחיפוש
        else if (propVal.search) {
          response = await axios.get(`${baseUrl}/lensearch`, {
            params: { search: searchValue },
          });
          setLength(response.data);
        }
        // אם נמצא ברשימת השמעה
        // else if (propVal.playlistId != "" && propVal.playlistId != null) {
        //   setLength(propVal.playlistLength);
        // }
      } catch (error) {
        console.error("Error in getting length:", error);
      }
    };
    getLength();
  }, [props]);

  // מעבר עמוד- paging
  const handlePageChange1 = (page) => {
    setCurrentPage(page); // Update the current page
    fetchData(page, filteredData, sort);
  };

  // קיראת שרת - שירים
  const fetchData = async (page, filter, sort) => {
    setLoading(true);
    const startIndex = (page - 1) * pageSize; // Calculate the starting index based on the page number
    console.log(startIndex);
    let response;
    try {
      if (callComponent == "playlist") {
        response = await axios.get(
          `${baseUrl}/getPlaylist?limit=${pageSize}&offset=${startIndex}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              playlistId: playlistId,
            },
          }
        );
      } else {
        response = await axios.get(
          `${baseUrl}/getsongs?limit=${pageSize}&offset=${startIndex}`,
          {
            params: {
              search: (searchValue = props.search), //propVal.search?propVal.search:null,
              filter: filter,
              sort: sort,
            },
          }
        );
      }
      const newData = response.data.songs;
      console.log("RRRRRRR", response.data);
      setData(newData);
      if (response.data.songListLength) {
        console.log("llllll", response.data.songListLength);
        setLength(response.data.songListLength);
      }
      console.log(length);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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
          <Divider style={customDividerStyle}>{callComponent}</Divider>

      {!isPlaylistActive && (
        <>
          <Row align="middle">
            <Col span={12} align="left">
              <Filter setFilteredData={setFilteredData} />
            </Col>
            <Col span={12} align="right">
              <Sort setSort={setSort} />
            </Col>
          </Row>
        </>
      )}
      <Spin spinning={loading} tip="Loading" size="large">
        <List
          style={{ paddingBottom: "20px" }}
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
          dataSource={data}
          pagination={{
            current: currentPage,
            onChange: handlePageChange1,
            pageSize: pageSize,
            total: length,
          }}
          renderItem={(item) => {
            if (!item) return null; // Skip rendering if item is missing
            return (
              <>
                <List.Item>
                  <Col>
                    {item.imageUrl && (
                      <Song
                        songDetails={item}
                        callComponent={callComponent}
                        setMiniAudioPlayer={setMiniAudioPlayer}
                        isSongPlaying={isSongPlaying}
                      />
                    )}
                  </Col>
                </List.Item>
              </>
            );
          }}
        />
      </Spin>

      {miniAudioPlayer.visible && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            width: "100%",
            backgroundColor: "black",
            zIndex: 999, // Ensure it appears above other content
          }}
        >
          <MiniPlayer
            audioUrl={miniAudioPlayer.audioUrl}
            name={miniAudioPlayer.name}
            songId={miniAudioPlayer.id}
            setIsSongPlaying={setIsSongPlaying}
          />
        </div>
      )}
    </>
  );
};

export default SongsList;
