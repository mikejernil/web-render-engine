import { FaRegMoon, FaRegSun } from 'react-icons/fa';

import { useTheme } from '../context/ThemeContext';

const ThemeSwitch = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div>
            <div
                className={`p-3 rounded-md backdrop-blur-md ${theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
                onClick={toggleTheme}
            >
                {theme == 'light' && <FaRegSun />}
                {theme == 'dark' && <FaRegMoon />}
            </div>
        </div>
    );
};

export default ThemeSwitch;
