import React, { useCallback } from 'react';
import { FaCamera } from 'react-icons/fa';

import { useTheme } from '../context/ThemeContext';

interface ScreenshotProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    setShowHelpers: React.Dispatch<React.SetStateAction<boolean>>;
}

const Screenshot: React.FC<ScreenshotProps> = ({ canvasRef, setShowHelpers }) => {
    const { theme } = useTheme();

    const takeScreenshot = useCallback(() => {
        if (!canvasRef.current) return;

        setShowHelpers(false);

        setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'webrender-screenshot.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }
                }, 'image/png');
            }
            setShowHelpers(true);
        }, 100);
    }, [canvasRef, setShowHelpers]);

    return (
        <button
            className={`p-3 rounded-lg backdrop-blur-md cursor-pointer select-none transition-colors ${
                theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-black/10 text-black hover:bg-black/20'
            }`}
            onClick={takeScreenshot}
            aria-label="Take Screenshot"
        >
            <FaCamera />
        </button>
    );
};

export default Screenshot;
