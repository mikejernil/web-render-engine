import { FC, useState } from 'react';

import { DeleteOutlined } from '@ant-design/icons';

import { useTheme } from '../context/ThemeContext';
import { Model } from '../types';

interface HierarchyProps {
    models: Model[];
    selectedModelIndex: number | null;
    onSelectModel: (index: number | null) => void;
    onDeleteModel: (id: string) => void;
}

const Hierarchy: FC<HierarchyProps> = ({
    models,
    selectedModelIndex,
    onSelectModel,
    onDeleteModel,
}) => {
    const { theme } = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <div
            className={`fixed left-2 top-1/2 z-10 p-2 gap-2 flex flex-col rounded-md backdrop-blur-md select-none w-80 max-h-[70vh] ${
                theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
            }`}
        >
            <div
                className={`p-2 gap-2 flex items-center justify-center rounded-md cursor-pointer flex-shrink-0 ${
                    theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
                }`}
                onClick={() => setOpen(!open)}
            >
                {open ? `Hierarchy ↓` : `Hierarchy →`}
            </div>

            <div
                className={`overflow-y-auto flex-1 ${
                    open ? 'transition-all duration-300' : 'hidden'
                }`}
            >
                {models.length === 0 ? (
                    <div
                        className={`py-2 text-center text-sm ${
                            theme === 'dark' ? 'text-white/50' : 'text-black/50'
                        }`}
                    >
                        No models loaded
                    </div>
                ) : (
                    <div className="space-y-1">
                        {models.map((model, index) => (
                            <div
                                key={model.id}
                                className={`p-2 rounded-md cursor-pointer select-none transition-colors flex items-center justify-between ${
                                    selectedModelIndex === index
                                        ? theme === 'dark'
                                            ? 'bg-white/20'
                                            : 'bg-black/20'
                                        : theme === 'dark'
                                          ? 'hover:bg-white/10'
                                          : 'hover:bg-black/10'
                                }`}
                                onClick={() => onSelectModel(index)}
                            >
                                <span className="flex-1 truncate">{model.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteModel(model.id);
                                    }}
                                    className={`ml-2 flex-shrink-0 outline-none border-none bg-transparent p-1 transition-all opacity-50 hover:opacity-100 hover:scale-110 focus:outline-none ${
                                        theme === 'dark' ? 'text-white' : 'text-black'
                                    }`}
                                    title="Delete model"
                                >
                                    <DeleteOutlined className="text-base" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hierarchy;
