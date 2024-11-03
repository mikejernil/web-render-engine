import { useState } from 'react';

import { CloudUploadOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Flex } from 'antd';
import { Input, Typography } from 'antd';
import { createStyles } from 'antd-style';

import Socials from './components/Socials';
import Viewer from './components/Viewer';

import './App.css';

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
        &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
            border-width: 0;

            > span {
                position: relative;
            }

            &::before {
                content: '';
                background: linear-gradient(135deg, #b993d6, #8ca6db);
                position: absolute;
                inset: 0;
                opacity: 1;
                transition: all 0.3s;
                border-radius: inherit;
            }

            &:hover::before {
                opacity: 0.85;
            }
        }
    `,
}));

function App() {
    const [viewGS, setViewGS] = useState(false);

    const [url, setUrl] = useState('');
    const [load, setLoad] = useState(false);

    const { Title } = Typography;
    const { styles } = useStyle();

    return (
        <>
            <div style={{ position: 'absolute', top: 1, left: 25, zIndex: 2 }}>
                <ConfigProvider
                    button={{
                        className: styles.linearGradientButton,
                    }}
                >
                    <Flex gap="small" align="start" vertical>
                        <Title className="app-title" level={3}>
                            Web Render Engine
                        </Title>
                        <Button
                            type="primary"
                            onClick={() => setViewGS(!viewGS)}
                            icon={<PlusCircleOutlined />}
                        >
                            {viewGS ? 'Load Sample GLB' : 'Load Splat model'}
                        </Button>
                        {viewGS && (
                            <>
                                <Flex gap="small">
                                    <Input
                                        placeholder="Enter .splat url"
                                        value={url}
                                        onChange={
                                            load
                                                ? (e) => {
                                                      setLoad(false);
                                                      setUrl(e.target.value);
                                                  }
                                                : (e) => setUrl(e.target.value)
                                        }
                                    />
                                    <Button
                                        icon={<CloudUploadOutlined />}
                                        type="primary"
                                        onClick={() => setLoad(true)}
                                    >
                                        {'Load '}
                                    </Button>
                                </Flex>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        setUrl(
                                            'https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat',
                                        );
                                        setLoad(true);
                                    }}
                                    icon={<UploadOutlined />}
                                >
                                    {'Load Sample - Shoe'}
                                </Button>
                            </>
                        )}
                    </Flex>
                </ConfigProvider>
            </div>
            <div style={{ background: 'white', width: '100vw', height: '100vh' }}>
                <Viewer viewGS={viewGS} url={url} load={load} />
            </div>
            {/* You can remove this section away for your own projects! */}
            <Socials />
        </>
    );
}

export default App;
