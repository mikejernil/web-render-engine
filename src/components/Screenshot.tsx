// Screenshot.tsx
import React from 'react';

interface ScreenshotProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    theme: 'dark' | 'light';
}

const Screenshot: React.FC<ScreenshotProps> = ({ canvasRef, theme }) => {
    const takeScreenshot = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
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
    };

    return (
        <div
            className={`p-2 rounded-md backdrop-blur-md cursor-pointer select-none ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
            onClick={takeScreenshot}
        >
            Screenshot
        </div>
    );
};

export default Screenshot;
