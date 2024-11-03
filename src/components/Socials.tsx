import { Divider, Flex, Space, Typography } from "antd";
import { LinkedinFilled, XOutlined, GithubFilled } from "@ant-design/icons";
import "../App.css";

const Socials = () => {
  const { Link } = Typography;

  return (
    <div
      id="jernil-socials"
      style={{ position: "absolute", bottom: 25, left: 25, zIndex: 2 }}
    >
      <Flex vertical>
        <Link href="https://www.3denginerd.com/" target="_blank">
          3D ENGINERD.
        </Link>
        <Space split={<Divider type="vertical" />}>
          <Link
            href="https://www.linkedin.com/in/michael-jernil/"
            target="_blank"
          >
            <LinkedinFilled />
          </Link>
          <Link href="https://github.com/mikejernil" target="_blank">
            <GithubFilled />
          </Link>
          <Link href="https://twitter.com/3denginerd" target="_blank">
            <XOutlined />
          </Link>
        </Space>
      </Flex>
    </div>
  );
};

export default Socials;
