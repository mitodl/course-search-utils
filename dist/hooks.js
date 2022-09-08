"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDidMountEffect = void 0;
var react_1 = require("react");
function useDidMountEffect(fn, deps) {
    var renderedOnce = react_1.useRef(false);
    react_1.useEffect(function () {
        if (renderedOnce.current) {
            fn();
        }
        else {
            renderedOnce.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
exports.useDidMountEffect = useDidMountEffect;
