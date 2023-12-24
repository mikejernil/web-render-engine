import { useState } from "react";
import { Button, Divider, Flex, Space, Tooltip } from "antd";
import "./App.css";
import Viewer from "./components/Viewer";
import { Typography } from "antd";

function App() {
  const [viewGS, setViewGS] = useState(false);

  const { Link, Title } = Typography;

  return (
    <>
      <div style={{ position: "absolute", top: 1, left: 25, zIndex: 2 }}>
        <Title style={{ opacity: 0.5 }} level={3}>
          Render Engine
        </Title>
        <Flex gap="small" vertical>
          <Button
            color="grey"
            style={{ width: 160 }}
            onClick={() => setViewGS(!viewGS)}
            type="primary"
          >
            {!viewGS ? "Show Me the SPLAT" : "Show Me the GLB"}
          </Button>
          <Tooltip title="Coming Soon." placement="right">
            <Button
              style={{ width: 160 }}
              onClick={() => setViewGS(!viewGS)}
              type="primary"
              disabled
            >
              Potree
            </Button>
          </Tooltip>
          <Tooltip title="Coming Soon." placement="right">
            <Button onClick={() => setViewGS(!viewGS)} type="primary" disabled>
              3D Tiles
            </Button>
          </Tooltip>
        </Flex>
      </div>
      <div style={{ background: "white", width: "100vw", height: "100vh" }}>
        <Viewer viewGS={viewGS} />
      </div>
      <div style={{ position: "absolute", top: 1, right: 25, zIndex: 2 }}>
        {/* <Flex vertical> */}
        <Title style={{ opacity: 0.5, userSelect: "none" }} level={5}>
          Michael Jernil
        </Title>
        <Space split={<Divider type="vertical" />}>
          <Link
            href="https://www.linkedin.com/in/michael-jernil/"
            target="_blank"
          >
            LinkedIn
          </Link>
          <Link href="https://github.com/mikejernil" target="_blank">
            GitHub
          </Link>
          <Link href="https://twitter.com/jernil_dev" target="_blank">
            X
          </Link>
        </Space>
        {/* </Flex> */}
      </div>
    </>
  );
}

export default App;
