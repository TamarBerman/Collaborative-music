import React from "react";
import { Form, Button } from "antd";
import { useState } from "react";


const Search = () => {
  

  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleInputChange = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchTerm.trim() !== "") {
      setErrorMsg("");
      // props.handleSearch(searchTerm);
    } else {
      setErrorMsg("Please enter a search term.");
    }
  };

  return (
    <>
      <div>
        <Form onSubmit={handleSearch}>
          {errorMsg && <p className="errorMsg">{errorMsg}</p>}
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Enter search term</Form.Label>
            <Form.Control
              type="search"
              name="searchTerm"
              value={searchTerm}
              placeholder="Search for album, artist or playlist"
              onChange={handleInputChange}
              autoComplete="off"
            />
          </Form.Group>
          <Button variant="info" type="submit">
            Search
          </Button>
        </Form>

        
      </div>
    </>
  );
};

export default Search;
