import { Card, Popover, Space, Row, Tag } from "antd";
import musicplay from "../../assets/images/musicplay.jpg";
import { useNavigate } from "react-router-dom";
import React from "react";
import { StarOutlined } from "@ant-design/icons";

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

const { Meta } = Card;
const Song = (props) => {
  const song = props.songDetails;
  const navigate = useNavigate();

  const navigateToPlayer = () => {
    console.log("in navigateToPlayer");
    navigate(`/${props.callComponent}/${song.id}`, { state: song });
  };

  return (
    <>
      <Row justify="center">
        <Card
          onClick={navigateToPlayer}
          hoverable
          style={{
            width: 240,
            margin: "auto",
            position: "relative",
            overflow: "hidden", // Hide any content that overflows the card
          }}
          cover={
            <div // Use a div for the cover instead of img
              style={{
                backgroundImage: `url(${song.imageUrl})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center", // Center the image
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            >
              <div // Add a div for the overlay
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "200px",
                  background: "rgba(0, 0, 0, 0.7)", // Black background with opacity
                  color: "#fff", // Text color
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: 0, // Hide the overlay initially
                  transition: "opacity 0.3s ease", // Add a smooth transition
                }}
                onMouseEnter={(e) => (e.target.style.opacity = 1)} // Show overlay on hover
                onMouseLeave={(e) => (e.target.style.opacity = 0)} // Hide overlay on mouse leave
              >
                <div // Add another div to wrap the description text
                  style={{
                    maxWidth: "200px", // Limit the width of the description
                    wordWrap: "break-word",
                    textAlign: "center",
                  }}
                >
                  {song.song_description}
                  <br />
                  {
                    <IconText
                      icon={StarOutlined}
                      text={song.rate}
                      key="list-vertical-rate"
                    />
                  }
                </div>
              </div>
            </div>
          }
        >
          <Meta title={song.song_name} />
          <Popover
            content={
              <div style={{ maxWidth: "240px", wordWrap: "break-word" }}>
                {song.song_description}
              </div>
            }
            title={
              <IconText
                icon={StarOutlined}
                text={song.rate}
                key="list-vertical-rate"
              />
            }
            trigger="hover"
            autoAdjustOverflow={false}
            overlayStyle={{ width: "240px" }}
          ></Popover>
        </Card>
      </Row>
    </>
  );
};

export default Song;

//   return (
//     <>
//       <Row justify="center">
//         <Card
//           onClick={navigateToPlayer}
//           hoverable
//           style={{
//             width: 240,
//             margin: "auto",
//           }}
//           cover={
//             <img
//               alt={song.song_name}
//               src={song.imageUrl}
//               style={{ width: "100%", height: "200px", objectFit: "cover" }}
//             />
//           }
//         >
//           <Popover
//             content={
//               <div style={{ maxWidth: "240px", wordWrap: "break-word" }}>
//                 {song.song_description}
//               </div>
//             }
//             title={
//               <IconText
//                 icon={StarOutlined}
//                 text={song.rate}
//                 key="list-vertical-rate"
//               />
//             } //{`${song.rate }`}
//             trigger="hover"
//             autoAdjustOverflow={false} // Set autoAdjustOverflow to false
//             overlayStyle={{ width: "240px" }} // Set a fixed width for the Popover
//           >
//             <Meta
//               title={song.song_name}
//               // description={
//               //   <>
//               //     {song.singer_name} | <StarOutlined /> {song.rate}{" "}
//               //   </>
//               // }
//             />
//           </Popover>
//           {/* {!song.permission && (
//             <Tag color="green" key={"preset"}>
//               {"private"}
//             </Tag>
//           )} */}
//         </Card>
//       </Row>
//     </>
//   );
// };
