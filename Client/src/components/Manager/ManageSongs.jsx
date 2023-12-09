import { SearchOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import {
  Button,
  Input,
  Space,
  Table,
  Tag,
  Popconfirm,
  message,
  Spin,
  Skeleton,
  Drawer,
  Image,
  FloatButton,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import AudioPlayer from "react-h5-audio-player";
import AdminLoginModal from "./AdminLoginModal";

const baseSongsUrl = "http://localhost:3000/mp3";

const ManageSongs = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const accessToken = cookies.access_token || null;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${baseSongsUrl}/getsongsinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const [data, setData] = useState([
    // {
    //   key: "1",
    //   songId: "64a2ab2587428e49a6989968",
    //   SongName: "John Brown",
    //   artist: 32,
    //   like: 84,
    //   tags: ["bad"],
    // },
  ]);
  // CHECKBOX
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteSelectedSongs = () => {
    // קריאת שרת למחיקת השירים
    console.log(selectedRowKeys);

    setDeleteLoading(true);
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setDeleteLoading(false);
    }, 1000);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  //   חיפוש
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  //   מחיקת שורה
  const handleDelete = (songId) => {
    setDeleteLoading(true);
    // קריאת שרת למחיקת האיבר .מחיקת ה SongID
    axios
      .delete(`${baseSongsUrl}/deleteSong/${songId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        const newData = data.filter((item) => item.songId !== songId);
        setData(newData);
      })
      .catch((error) => {
        console.log("in catch");
        console.log(error);
        if (error.status === 404) {
          message.warning("השיר כבר לא קיים..");
        }
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };
  //    האזנה לשיר
  const audioPlayerRef = useRef(null);
  const [songDetails, setSongDetails] = useState({});
  const listenToSong = (songId) => {
    const baseUrl = "http://localhost:3000/mp3";
    axios
      .get(`${baseUrl}/getSong/${songId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        console.log(response.data);
        const song = response.data;
        setSongDetails({
          song_name: song.song_name,
          song_description: song.song_description,
          song_rate: song.rate,
          audio_url: song.audioUrl,
          image_url: song.imageUrl,
          song_id: song.id,
          like: response.data.likeCount || 0,
          artists: song.artists,
          album: song.album,
          duration: song.duration,
          title: song.title,
          genre: song.genre,
          comment: song.comment,
          year: song.year,
          description: song.description,
        });
        showDefaultDrawer();
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 404) {
          message.warning("השיר כבר לא קיים..");
        } else message.error("ארעה שגיאה בצד השרת");
      });
  };

  // האזנה לשיר
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState();
  const showDefaultDrawer = () => {
    setSize("default");
    setOpen(true);
  };
  const showLargeDrawer = () => {
    setSize("large");
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
    // Pause the audio playback using the ref
    if (audioPlayerRef.current) {
      audioPlayerRef.current.audio.current.pause();
    }
  };
  // עמודות בטבלה
  const columns = [
    {
      title: "Song name",
      dataIndex: "title",
      key: "title",
      width: "20%",
      ...getColumnSearchProps("title"),
    },
    {
      title: "Artist",
      dataIndex: "artists",
      key: "artists",
      width: "12%",
    },
    {
      title: "Album",
      dataIndex: "album",
      key: "album",
      width: "12%",
    },
    {
      title: "Like",
      dataIndex: "like",
      key: "like",
      sorter: (a, b) => a.like - b.like,
      sortDirections: ["descend", "ascend"],
      width: "8%",
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      width: "8%",
      sorter: (a, b) => a.rate - b.rate,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Tags",
      key: "tags",
      dataIndex: "tags",
      render: (_, { tags }) => (
        <>
          {tags.map((tag) => {
            let color = "red"; //tag.length > 5 ? "red" : "green";
            if (tag === "Love") {
              color = "yellow";
            } else if (tag === "bad") {
              color = "red";
            }
            console.log(tag);
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
      width: "10%",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => listenToSong(record.songId)}>
            Listen to {record.title}
          </a>
        </Space>
      ),
      width: "15%",
    },
    {
      title: "operation",
      dataIndex: "operation",
      render: (_, record) =>
        data.length >= 1 ? (
          <Popconfirm
            loading={deleteLoading}
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.songId)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
      width: "10%",
    },
  ];
  return (
    <>
      <div
        style={{
          height: "280vh",
          padding: 10,
        }}
      >
        {loading ? (
          <Skeleton
            active
            paragraph={{ rows: 17, width: ["100%"] }}
            title={{ width: "100%" }}
          />
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            pagination={{
              pageSize: 25, // Set the page size to 20
            }}
          />
        )}
        <div
          style={{
            marginBottom: 16,
          }}
        >
          <Button
            type="primary"
            onClick={deleteSelectedSongs}
            disabled={!hasSelected}
            loading={deleteLoading}
          >
            Delete
          </Button>
          <span
            style={{
              marginLeft: 8,
            }}
          >
            {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
          </span>
        </div>
        {/* חלונית צדדית להאזה לשיר */}

        <Drawer
          title={`Play Song`}
          placement="right"
          size={size}
          onClose={onClose}
          open={open}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <p>{songDetails.title}</p>
            {/* <PlaySong songDetails={songDetails}/> */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Image
                style={{
                  width: "300px",
                  margin: "auto",
                }}
                src={songDetails.image_url}
                preview={{
                  src: songDetails.image_url,
                }}
              />
            </div>

            <AudioPlayer
              ref={audioPlayerRef}
              src={songDetails.audio_url}
              autoPlay
              controls
              volume={0.6}
              loop={false}
            />
          </div>
        </Drawer>
        <FloatButton.BackTop />
      </div>
    </>
  );
};
export default ManageSongs;

// navigate(`/music/${songId}`, { state: response.data });

//         // Open the page in a new tab
//   const newTab = window.open(`/music/${songId}`, '_blank');
//   if (newTab) {
//     // Pass data to the new tab if needed
//     newTab.data = response.data;
//   } else {
//     // Handle if the new tab was blocked by the browser's popup blocker
//     console.log('The new tab was blocked by the browser');
//   }
