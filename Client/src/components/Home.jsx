import * as React from "react";
import { AudioOutlined } from "@ant-design/icons";
import { Input } from "antd";
import SongsList from "./SongsList/SongsList";
import { useEffect, useState } from "react";
const { Search } = Input;

const Home = () => {
  const [searchValue, setSearchValue] = useState("");
  const [startSearch, setStartSearch] = useState(false);

  useEffect(() => {
    console.log("startSearch changed");
  }, [startSearch]);

  const suffix = (
    <AudioOutlined
      style={{
        fontSize: 16,
        color: "#1677ff",
        padding:"2px"
      }}
    />
  );
  const onSearch = (value) => {
    setStartSearch(true);
    console.log(value);
  };

  return (
    <>
      <div
        style={{
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: "500px",
        }}
      >
        <h2 style={{ color: "white" }}>Welcome!</h2>

        <Search
          placeholder="  Input search text"
          enterButton="Search"
          size="large"
          value={searchValue}
          suffix={suffix}
          onSearch={onSearch}
          onChange={(event) => {
            setSearchValue(event.target.value);
            setStartSearch(false);
          }}
          style={{lineHeight:2.15, padding:"2px"}}
        />

        {startSearch && <SongsList search={searchValue} />}
        {/* {!startSearch && <SongsList />} */}
      </div>
    </>
  );
};
export default Home;
