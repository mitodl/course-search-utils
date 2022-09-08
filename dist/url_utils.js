"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeSearchParams = exports.serializeUI = exports.serializeSort = exports.deserializeSearchParams = exports.deserializeUI = exports.deserializeSort = exports.toArray = void 0;
var _ = __importStar(require("lodash"));
var qs = __importStar(require("query-string"));
exports.toArray = function (obj) {
    return Array.isArray(obj) ? obj : obj ? [obj] : undefined;
};
var urlParamToArray = function (param) {
    return _.union(exports.toArray(param) || []);
};
var handleText = function (q) {
    if (Array.isArray(q)) {
        return q.join("");
    }
    if (q === null || q === undefined) {
        return "";
    }
    return q;
};
exports.deserializeSort = function (sortParam) {
    if (!sortParam) {
        return null;
    }
    if (sortParam.startsWith("-")) {
        return {
            field: sortParam.slice(1),
            option: "desc"
        };
    }
    else {
        return {
            field: sortParam,
            option: "asc"
        };
    }
};
exports.deserializeUI = function (uiParam) {
    if (!uiParam) {
        return null;
    }
    return uiParam;
};
exports.deserializeSearchParams = function (_a) {
    var search = _a.search;
    var searchUrlParams = search.replace(/^\?/, "").split("?", 1)[0];
    var _b = qs.parse(searchUrlParams), type = _b.type, o = _b.o, t = _b.t, q = _b.q, a = _b.a, c = _b.c, d = _b.d, l = _b.l, f = _b.f, r = _b.r, s = _b.s, u = _b.u;
    return {
        text: handleText(q),
        activeFacets: {
            audience: urlParamToArray(a),
            certification: urlParamToArray(c),
            type: urlParamToArray(type),
            offered_by: urlParamToArray(o),
            topics: urlParamToArray(t),
            department_name: urlParamToArray(d),
            level: urlParamToArray(l),
            course_feature_tags: urlParamToArray(f),
            resource_type: urlParamToArray(r) // eslint-disable-line camelcase
        },
        sort: exports.deserializeSort(handleText(s)),
        ui: exports.deserializeUI(handleText(u))
    };
};
exports.serializeSort = function (sort) {
    if (sort === null) {
        // leave it off the params if set to default
        return undefined;
    }
    if (sort.option === "desc") {
        return "-" + sort.field;
    }
    else {
        return sort.field;
    }
};
exports.serializeUI = function (ui) {
    if (ui === null) {
        // leave it off the params if set to default
        return undefined;
    }
    return ui;
};
exports.serializeSearchParams = function (_a) {
    var text = _a.text, activeFacets = _a.activeFacets, sort = _a.sort, ui = _a.ui;
    var _b = activeFacets !== null && activeFacets !== void 0 ? activeFacets : {}, type = _b.type, offered_by = _b.offered_by, // eslint-disable-line camelcase
    topics = _b.topics, audience = _b.audience, certification = _b.certification, department_name = _b.department_name, // eslint-disable-line camelcase
    level = _b.level, course_feature_tags = _b.course_feature_tags, // eslint-disable-line camelcase
    resource_type = _b.resource_type // eslint-disable-line camelcase
    ;
    return qs.stringify({
        q: text || undefined,
        type: type,
        a: audience,
        c: certification,
        o: offered_by,
        t: topics,
        d: department_name,
        l: level,
        f: course_feature_tags,
        r: resource_type,
        s: exports.serializeSort(sort || null),
        u: exports.serializeUI(ui || null)
    });
};
