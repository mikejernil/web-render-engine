import { useState } from "react";
import { Button, Flex, Tooltip } from "antd";
import "./App.css";
import Viewer from "./components/Viewer";
import { Typography } from "antd";
import Socials from "./components/Socials";

function App() {
  const [viewGS, setViewGS] = useState(false);

  const { Title } = Typography;

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
      {/* You can throw this section away for your own projects! */}
      <Socials />
    </>
  );
}

export default App;
