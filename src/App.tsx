import { useState } from "react";
import { Button, Flex } from "antd";
import "./App.css";
import Viewer from "./components/Viewer";
import { Typography, Input } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import Socials from "./components/Socials";

function App() {
  const [viewGS, setViewGS] = useState(false);
  const [loadGLB, setLoadGLB] = useState(false);

  const [url, setUrl] = useState("");
  const [load, setLoad] = useState(false);

  const { Title } = Typography;
  const { Search } = Input;

  return (
    <>
      <div style={{ position: "absolute", top: 1, left: 25, zIndex: 2 }}>
        <Flex gap="small" align="start" vertical>
          <Title className="app-title" level={2}>
            Web Render Engine
          </Title>
          <Button
            className="btn-grad"
            size="large"
            onClick={() => setViewGS(true)}
            type={undefined}
          >
            <PlusCircleOutlined />
            {"Load Splat model"}
          </Button>
          {viewGS && (
            <>
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
              <Button
                color="grey"
                onClick={() => {
                  setUrl(
                    "https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat"
                  );
                  setLoad(true);
                }}
                type="primary"
              >
                {"Load Sample Splat - Shoe"}
              </Button>
            </>
          )}
          {/* <Button
            className="btn-grad"
            size="large"
            onClick={() => setLoadGLB(!loadGLB)}
            type="secondary"
          >
            <PlusCircleOutlined />
            {"Add glTF model"}
          </Button>
          {loadGLB && (
            <>
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
                placeholder="Enter glTF url"
                enterButton="Load"
                onSearch={() => setLoad(true)}
              />
              <Button
                color="grey"
                onClick={() => {
                  setUrl(
                    "https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat"
                  );
                  setLoad(true);
                }}
                type="primary"
              >
                {"Load Sample GLB - Duck"}
              </Button>
            </>
          )} */}
        </Flex>
      </div>
      <div style={{ background: "white", width: "100vw", height: "100vh" }}>
        <Viewer viewGS={viewGS} url={url} load={load} />
      </div>
      {/* You can remove this section away for your own projects! */}
      <Socials />
    </>
  );
}

export default App;
