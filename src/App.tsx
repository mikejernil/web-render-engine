import { useState } from "react";
import { Button, Flex, Tooltip } from "antd";
import "./App.css";
import Viewer from "./components/Viewer";
import { Typography, Input } from "antd";
import Socials from "./components/Socials";

function App() {
  const [viewGS, setViewGS] = useState(false);
  const [url, setUrl] = useState("");
  const [load, setLoad] = useState(false);

  const { Title } = Typography;
  const { Search } = Input;

  return (
    <>
      <div style={{ position: "absolute", top: 1, left: 25, zIndex: 2 }}>
        <Flex gap="small" align="start" vertical>
          <Title style={{ opacity: 0.8 }} level={3}>
            Web Render Engine
          </Title>

          <Button
            color="grey"
            style={{ width: 160 }}
            onClick={() => setViewGS(!viewGS)}
            type="primary"
          >
            {!viewGS ? "Show Me the SPLAT" : "Show Me the GLB"}
          </Button>
          {viewGS && (
            <Search
              value={url}
              onChange={
                load
                  ? (e) => {
                      setLoad(false);
                      setUrl(e.target.value);
                    }
                  : (e) => setUrl(e.target.value)
              }
              placeholder="Enter .splat url"
              enterButton="Load"
              onSearch={() => setLoad(true)}
            />
          )}
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
            <Button
              style={{ width: 160 }}
              onClick={() => setViewGS(!viewGS)}
              type="primary"
              disabled
            >
              3D Tiles
            </Button>
          </Tooltip>
        </Flex>
      </div>
      <div style={{ background: "white", width: "100vw", height: "100vh" }}>
        <Viewer viewGS={viewGS} url={url} load={load} />
      </div>
      {/* You can throw this section away for your own projects! */}
      <Socials />
    </>
  );
}

export default App;
