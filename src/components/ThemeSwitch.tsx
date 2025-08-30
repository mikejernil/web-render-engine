import { FaRegMoon, FaRegSun } from 'react-icons/fa';

import { useTheme } from '../context/ThemeContext';

const ThemeSwitch: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative w-16 h-9 flex items-center rounded-full transition-colors duration-300 focus:outline-none
            ${theme === 'light' ? 'bg-black/20' : 'bg-white/20'}`}
        >
            <div
                className={`absolute w-7 h-7 bg-black/50 rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center
                ${theme === 'light' ? 'translate-x-1' : 'translate-x-8'}`}
            >
                {theme === 'light' ? (
                    <FaRegSun className="text-white" size={16} />
                ) : (
                    <FaRegMoon className="text-white" size={16} />
                )}
            </div>
        </button>
    );
};

export default ThemeSwitch;
