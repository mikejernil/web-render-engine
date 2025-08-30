import { Sky as SkyImpl } from 'three/examples/jsm/objects/Sky';

import { Node } from '@react-three/fiber';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            sky: Node<SkyImpl, typeof SkyImpl>;
        }
    }
}
