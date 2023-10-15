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
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const baseUsersUrl = "http://localhost:3000/users";

const ManageSongs = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const accessToken = cookies.access_token || null;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${baseUsersUrl}/getUsers`, {
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
  ]);
  // CHECKBOX
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteSelectedUsers = () => {
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
  const handleDelete = (userId) => {
    setDeleteLoading(true);
    // קריאת שרת למחיקת האיבר .מחיקת ה SongID
    axios
      .delete(`${baseUsersUrl}/deleteUser/${userId}`)
      .then((response) => {
        console.log(response.data);
        const newData = data.filter((item) => item.userId !== userId);
        setData(newData);
      })
      .catch((error) => {
        alert("catch");
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
  //   ניווט להאזנה לשיר
  const listenToSong = (songId) => {
    const baseUrl = "http://localhost:3000/mp3";
    axios
      .get(`${baseUrl}/getSong/${songId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        console.log(response.data);
        navigate(`/music/${songId}`, { state: response.data });
        //         // Open the page in a new tab
        //   const newTab = window.open(`/music/${songId}`, '_blank');
        //   if (newTab) {
        //     // Pass data to the new tab if needed
        //     newTab.data = response.data;
        //   } else {
        //     // Handle if the new tab was blocked by the browser's popup blocker
        //     console.log('The new tab was blocked by the browser');
        //   }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 404) {
          message.warning("השיר כבר לא קיים..");
        } else message.error("ארעה שגיאה בצד השרת");
      });
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      width: "12%",
      //   ...getColumnSearchProps('age'),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "12%",
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
      {/* <Spin spinning={loading} tip="Loading" size="large"> */}
      {loading ? (
    <Skeleton  active paragraph={{ rows: 17 , width: ['100%'] }}title={{ width: '100%' }} />
  ) : (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
    />
  )}
      {/* </Spin> */}
      <div
        style={{
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          onClick={deleteSelectedUsers}
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
    </>
  );
};
export default ManageSongs;
