import { GithubFilled, LinkedinFilled, XOutlined } from '@ant-design/icons';

import { useTheme } from '../context/ThemeContext';

const Socials = () => {
    const { theme } = useTheme();
    const iconColor = theme === 'dark' ? 'text-white' : 'text-black';

    return (
        <div
            className={`fixed bottom-2 left-2 z-20 backdrop-blur-md p-2 rounded-lg ${
                theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
            }`}
        >
            <div>
                <a
                    href="https://www.3denginerd.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-bold ${iconColor} no-underline`}
                >
                    3D ENGINERD.
                </a>
                <div className="flex justify-between space-x-4 mt-2">
                    <a
                        href="https://www.linkedin.com/in/michael-jernil/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <LinkedinFilled className={`cursor-pointer ${iconColor}`} />
                    </a>
                    <a
                        href="https://github.com/mikejernil"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GithubFilled className={`cursor-pointer ${iconColor}`} />
                    </a>
                    <a
                        href="https://twitter.com/3denginerd"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <XOutlined className={`cursor-pointer ${iconColor}`} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Socials;
