import {
  List,
  Typography,
  Col,
  Divider,
  Spin
} from "antd";
import Song from "./Song";
import { useState, useEffect } from "react";
import axios from "axios";
import Filter from "./Filter";
import { useCookies } from "react-cookie";

const SongsList = (props) => {
  const { Title } = Typography;
  const baseUrl = "http://localhost:3000/mp3";
  let propVal = !props.search && !props.userId ? null : props;
  let P_search = props.search || null;
  let P_userId = props.userId || null;
  let P_ids = props.songsIds || null;
  const [ids, setIds] = useState([]);
  const pageSize = 8; // Number of elements to display per page
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [length, setLength] = useState(pageSize);
  const [type, setType] = useState("all");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const accessToken = cookies.access_token || null;
  const callComponent = P_userId ? "playlist" : "music";

  // כאשר מופעל הסינון עידכון ערכי הסינון וקריאה
  useEffect(() => {
    P_ids = props.songsIds || null;
    setIds(props.songsIds || []);
      setCurrentPage(1);
      fetchData(1, "", filteredData);
  }, [filteredData]);

  // כאשר מתרנדר העמוד- בדיקת אורך לעדכון pagination
  useEffect(() => {
    const getLength = async () => {
      try {
        let response;
        if (!propVal) {
          response = await axios.get(`${baseUrl}/len`);
        } else if (propVal.search) {
          response = await axios.get(`${baseUrl}/lensearch`, {
            params: { search: P_search },
          });
        } else if (propVal.userId) {
          response = await axios.get(`${baseUrl}/lenplaylist`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
        console.log("len", response.data);
        setLength(response.data);
      } catch (error) {
        console.error("Error in getting length:", error);
      }
    };
    getLength();
  }, [props]);

  // מעבר עמוד- paging
  const handlePageChange1 = (page) => {
    setCurrentPage(page); // Update the current page
    fetchData(page, type, filteredData);
  };

  // קיראת שרת - שירים
  const fetchData = async (page, mytype, body) => {
    setLoading(true);
    const startIndex = (page - 1) * pageSize; // Calculate the starting index based on the page number
    let response;
    console.log("ids: ", ids);
    try {
      response = await axios.get(
        `${baseUrl}/getsongs?limit=${pageSize}&offset=${startIndex}`,
        {
          params: {
            search: (P_search = props.search), //propVal.search?propVal.search:null,
            filter: body,
            // userId: P_userId,
            ids: P_ids,
          },
        }
      );
      const newData = response.data;
      setData(newData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      <Divider style={customDividerStyle}>Music</Divider>

      <Filter setFilteredData={setFilteredData} />
      {/* <Title>All Music</Title> */}
      <Spin spinning={loading} tip="Loading" size="large">
        <List
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
                      <Song songDetails={item} callComponent={callComponent} />
                    )}
                  </Col>
                </List.Item>
              </>
            );
          }}
        />
      </Spin>
    </>
  );
};

export default SongsList;

