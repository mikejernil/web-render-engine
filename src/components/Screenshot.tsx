import React from 'react';
import { FaCamera } from 'react-icons/fa';

interface ScreenshotProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    theme: 'dark' | 'light';
    setShowHelpers: React.Dispatch<React.SetStateAction<boolean>>;
}

const Screenshot: React.FC<ScreenshotProps> = ({ canvasRef, theme, setShowHelpers }) => {
    const takeScreenshot = () => {
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
                        link.download = 'canvas-screenshot.png';
                        link.click();
                        URL.revokeObjectURL(url);
                    }
                }, 'image/png');
            }

            setShowHelpers(true);
        }, 100);
    };

    return (
        <div
            className={`p-3 rounded-md backdrop-blur-md cursor-pointer select-none ${
                theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
            }`}
            onClick={takeScreenshot}
        >
            <FaCamera />
        </div>
    );
};

export default Screenshot;
