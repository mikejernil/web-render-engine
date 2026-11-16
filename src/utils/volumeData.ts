import { DataFormat } from '../types';

/**
 * Get the maximum possible value for a given data format.
 */
export function getMaxValueForFormat(format: DataFormat): number {
    switch (format) {
        case 'uint8':
            return 255;
        case 'uint16':
            return 65535;
        case 'uint32':
            return 4294967295;
        case 'float32':
            return 1.0;
        default:
            return 255;
    }
}

/**
 * Detect the data format of a typed array.
 */
export function detectFormat(
    data: Uint8Array | Uint16Array | Uint32Array | Float32Array,
): DataFormat {
    if (data instanceof Uint8Array) return 'uint8';
    if (data instanceof Uint16Array) return 'uint16';
    if (data instanceof Uint32Array) return 'uint32';
    if (data instanceof Float32Array) return 'float32';
    return 'uint8';
}
