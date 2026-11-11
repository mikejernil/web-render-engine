import React, { useCallback } from 'react';

interface ScreenshotProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    theme: 'dark' | 'light';
    setShowHelpers: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Captures a clean canvas PNG with scene helpers hidden. */
const Screenshot: React.FC<ScreenshotProps> = ({ canvasRef, theme, setShowHelpers }) => {
    // Hide helpers, wait for next render, then save screenshot
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
                        link.download = 'canvas-screenshot.png';
                        link.click();
                        URL.revokeObjectURL(url);
                    }
                    setShowHelpers(true);
                }, 'image/png');
            } else {
                setShowHelpers(true);
            }
        }, 100);
    }, [canvasRef, setShowHelpers]);

    return (
        <div
            className={`p-2 rounded-md backdrop-blur-md cursor-pointer select-none ${
                theme == 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
            }`}
            onClick={takeScreenshot}
        >
            Screenshot
        </div>
    );
};

export default Screenshot;
