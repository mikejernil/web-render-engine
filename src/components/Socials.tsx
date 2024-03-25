import { Divider, Flex, Space, Typography } from "antd";

const Socials = () => {
  const { Link, Title } = Typography;

  return (
    <div
      id="jernil-socials"
      style={{ position: "absolute", bottom: 25, left: 25, zIndex: 2 }}
    >
      <Flex vertical>
        <Title style={{ opacity: 0.6, userSelect: "none" }} level={5}>
          Michael Jernil
        </Title>
        <Link href="https://www.3denginerd.com/" target="_blank">
          3D ENGINERD.
        </Link>
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
      </Flex>
    </div>
  );
};

export default Socials;
