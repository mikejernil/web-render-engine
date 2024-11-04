import { GithubFilled, LinkedinFilled, XOutlined } from '@ant-design/icons';

import { useTheme } from '../context/ThemeContext';

const Socials = () => {
    const { theme } = useTheme();
    return (
        <div
            className={` backdrop-blur-md p-1 rounded-md ${theme == 'dark' ? 'bg-white/10' : 'bg-black/10'}`}
            id="jernil-socials"
            style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 2 }}
        >
            <div>
                <a
                    href="https://www.3denginerd.com/"
                    target="_blank"
                    className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} no-underline`}
                    style={{ color: theme === 'dark' ? 'white' : 'black', textDecoration: 'none' }}
                >
                    3D ENGINERD.
                </a>

                <div className="flex justify-between w-full ">
                    <a href="https://www.linkedin.com/in/michael-jernil/" target="_blank">
                        <LinkedinFilled
                            className={`cursor-pointer ${theme == 'dark' ? 'text-white' : 'text-black'}`}
                        />
                    </a>
                    <a href="https://github.com/mikejernil" target="_blank">
                        <GithubFilled
                            className={`cursor-pointer ${theme == 'dark' ? 'text-white' : 'text-black'}`}
                        />
                    </a>
                    <a href="https://twitter.com/3denginerd" target="_blank">
                        <XOutlined
                            className={`cursor-pointer ${theme == 'dark' ? 'text-white' : 'text-black'}`}
                        />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Socials;
