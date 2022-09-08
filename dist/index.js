"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCourseSearch = exports.mergeFacetResults = exports.buildSearchQuery = void 0;
var react_1 = require("react");
var ramda_1 = require("ramda");
var lodash_1 = __importDefault(require("lodash"));
var history_1 = require("history");
var constants_1 = require("./constants");
var url_utils_1 = require("./url_utils");
var hooks_1 = require("./hooks");
__exportStar(require("./constants"), exports);
__exportStar(require("./url_utils"), exports);
var search_1 = require("./search");
Object.defineProperty(exports, "buildSearchQuery", { enumerable: true, get: function () { return search_1.buildSearchQuery; } });
exports.mergeFacetResults = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return ({
        buckets: args
            .map(ramda_1.prop("buckets"))
            // @ts-ignore
            .reduce(function (buckets, acc) { return ramda_1.unionWith(ramda_1.eqBy(ramda_1.prop("key")), buckets, acc); })
    });
};
var defaultHistory = history_1.createBrowserHistory();
exports.useCourseSearch = function (runSearch, clearSearch, aggregations, loaded, searchPageSize, history) {
    if (history === void 0) { history = defaultHistory; }
    var _a = react_1.useState(false), incremental = _a[0], setIncremental = _a[1];
    var _b = react_1.useState(0), from = _b[0], setFrom = _b[1];
    var _c = react_1.useState(function () {
        var text = url_utils_1.deserializeSearchParams(window.location).text;
        return text;
    }), text = _c[0], setText = _c[1];
    var _d = react_1.useState(function () {
        var _a = url_utils_1.deserializeSearchParams(window.location), activeFacets = _a.activeFacets, sort = _a.sort, ui = _a.ui;
        return { activeFacets: activeFacets, sort: sort, ui: ui };
    }), activeFacetsAndSort = _d[0], setActiveFacetsAndSort = _d[1];
    var facetOptions = react_1.useCallback(function (group) {
        var emptyFacet = { buckets: [] };
        var activeFacets = activeFacetsAndSort.activeFacets;
        var emptyActiveFacets = {
            buckets: (activeFacets[group] || []).map(function (facet) { return ({
                key: facet,
                doc_count: 0
            }); })
        };
        if (!aggregations) {
            return null;
        }
        return exports.mergeFacetResults(aggregations.get(group) || emptyFacet, emptyActiveFacets);
    }, [aggregations, activeFacetsAndSort]);
    var clearAllFilters = react_1.useCallback(function () {
        setText("");
        setActiveFacetsAndSort({
            activeFacets: constants_1.INITIAL_FACET_STATE,
            sort: null,
            ui: null
        });
    }, [setText, setActiveFacetsAndSort]);
    var toggleFacet = react_1.useCallback(function (name, value, isEnabled) {
        var activeFacets = activeFacetsAndSort.activeFacets, sort = activeFacetsAndSort.sort, ui = activeFacetsAndSort.ui;
        var newFacets = ramda_1.clone(activeFacets);
        if (isEnabled) {
            newFacets[name] = lodash_1.default.union(newFacets[name] || [], [value]);
        }
        else {
            newFacets[name] = lodash_1.default.without(newFacets[name] || [], value);
        }
        setActiveFacetsAndSort({ activeFacets: newFacets, sort: sort, ui: ui });
    }, [activeFacetsAndSort, setActiveFacetsAndSort]);
    var toggleFacets = react_1.useCallback(function (facets) {
        var activeFacets = activeFacetsAndSort.activeFacets, sort = activeFacetsAndSort.sort, ui = activeFacetsAndSort.ui;
        var newFacets = ramda_1.clone(activeFacets);
        facets.forEach(function (_a) {
            var name = _a[0], value = _a[1], isEnabled = _a[2];
            if (isEnabled) {
                newFacets[name] = lodash_1.default.union(newFacets[name] || [], [value]);
            }
            else {
                newFacets[name] = lodash_1.default.without(newFacets[name] || [], value);
            }
        });
        setActiveFacetsAndSort({ activeFacets: newFacets, sort: sort, ui: ui });
    }, [activeFacetsAndSort, setActiveFacetsAndSort]);
    var onUpdateFacets = react_1.useCallback(function (e) { return toggleFacet(e.target.name, e.target.value, e.target.checked); }, [toggleFacet]);
    var updateText = react_1.useCallback(function (event) {
        var text = event ? event.target.value : "";
        setText(text);
    }, [setText]);
    var updateSort = react_1.useCallback(function (event) {
        var param = event ? event.target.value : "";
        var newSort = url_utils_1.deserializeSort(param);
        var activeFacets = activeFacetsAndSort.activeFacets, ui = activeFacetsAndSort.ui;
        setActiveFacetsAndSort({ activeFacets: activeFacets, sort: newSort, ui: ui }); // this will cause a search via useDidMountEffect
    }, [setActiveFacetsAndSort, activeFacetsAndSort]);
    var updateUI = react_1.useCallback(function (newUI) {
        var activeFacets = activeFacetsAndSort.activeFacets, sort = activeFacetsAndSort.sort;
        setActiveFacetsAndSort({ activeFacets: activeFacets, sort: sort, ui: newUI }); // this will cause a search via useDidMountEffect
    }, [setActiveFacetsAndSort, activeFacetsAndSort]);
    var internalRunSearch = react_1.useCallback(function (text, activeFacetsAndSort, incremental) {
        if (incremental === void 0) { incremental = false; }
        return __awaiter(void 0, void 0, void 0, function () {
            var nextFrom, activeFacets, sort, ui, searchFacets, currentSearch, newSearch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextFrom = from + searchPageSize;
                        if (!incremental) {
                            clearSearch();
                            nextFrom = 0;
                        }
                        setFrom(nextFrom);
                        setIncremental(incremental);
                        activeFacets = activeFacetsAndSort.activeFacets, sort = activeFacetsAndSort.sort, ui = activeFacetsAndSort.ui;
                        searchFacets = ramda_1.clone(activeFacets);
                        if (searchFacets.type !== undefined && searchFacets.type.length > 0) {
                            if (searchFacets.type.includes(constants_1.LearningResourceType.Podcast)) {
                                searchFacets.type.push(constants_1.LearningResourceType.PodcastEpisode);
                            }
                            if (searchFacets.type.includes(constants_1.LearningResourceType.Userlist)) {
                                searchFacets.type.push(constants_1.LearningResourceType.LearningPath);
                            }
                        }
                        else {
                            searchFacets.type = constants_1.LR_TYPE_ALL;
                        }
                        return [4 /*yield*/, runSearch(text, searchFacets, nextFrom, sort, ui)
                            // search is updated, now echo params to URL bar
                        ];
                    case 1:
                        _a.sent();
                        currentSearch = url_utils_1.serializeSearchParams(url_utils_1.deserializeSearchParams(window.location));
                        newSearch = url_utils_1.serializeSearchParams({
                            text: text,
                            activeFacets: activeFacets,
                            sort: sort,
                            ui: ui
                        });
                        if (currentSearch !== newSearch) {
                            history.push("?" + newSearch);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }, [
        from,
        setFrom,
        setIncremental,
        clearSearch,
        runSearch,
        searchPageSize,
        history
    ]);
    var initSearch = react_1.useCallback(function (location) {
        var _a = url_utils_1.deserializeSearchParams(location), text = _a.text, activeFacets = _a.activeFacets, sort = _a.sort, ui = _a.ui;
        clearSearch();
        setText(text);
        setActiveFacetsAndSort({ activeFacets: activeFacets, sort: sort, ui: ui });
    }, [clearSearch, setText, setActiveFacetsAndSort]);
    var clearText = react_1.useCallback(function (event) {
        event.preventDefault();
        setText("");
        internalRunSearch("", activeFacetsAndSort);
    }, [activeFacetsAndSort, setText, internalRunSearch]);
    var acceptSuggestion = react_1.useCallback(function (suggestion) {
        setText(suggestion);
        internalRunSearch(suggestion, activeFacetsAndSort);
    }, [setText, activeFacetsAndSort, internalRunSearch]);
    // this is our 'on startup' useEffect call
    react_1.useEffect(function () {
        initSearch(window.location);
        // dependencies intentionally left blank here, because this effect
        // needs to run only once - it's just to initialize the search state
        // based on the value of the URL (if any)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    react_1.useEffect(function () {
        // We push browser state into the history when a piece of the URL changes. However
        // pressing the back button will update the browser stack but the UI does not respond by default.
        // So we have to trigger this change explicitly.
        var unlisten = history.listen(function (_a) {
            var location = _a.location, action = _a.action;
            if (action === "POP") {
                // back button pressed
                // @ts-ignore
                initSearch(location);
            }
        });
        return unlisten;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var loadMore = react_1.useCallback(function () {
        if (!loaded) {
            // this function will be triggered repeatedly by <InfiniteScroll />, filter it to just once at a time
            return;
        }
        internalRunSearch(text, activeFacetsAndSort, true);
    }, [internalRunSearch, loaded, text, activeFacetsAndSort]);
    // this effect here basically listens to parts of the search UI which should cause an immediate rerun of
    // the search whenever they change. we always want these changes to take
    // effect immediately, so we need to either do this or call runSearch from
    // our facet-related callbacks. this approach lets us avoid having the
    // facet-related callbacks (toggleFacet, etc) be dependent on then value of
    // the runSearch function, which leads to too much needless churn in the
    // facet callbacks and then causes excessive re-rendering of the facet UI
    hooks_1.useDidMountEffect(function () {
        internalRunSearch(text, activeFacetsAndSort);
    }, [activeFacetsAndSort]);
    var onSubmit = react_1.useCallback(function (e) {
        var _a;
        if (e.type === "submit") {
            console.log("Submit event. Preventing default.");
            (_a = e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
        }
        internalRunSearch(text, activeFacetsAndSort);
    }, [internalRunSearch, text, activeFacetsAndSort]);
    var sort = activeFacetsAndSort.sort, activeFacets = activeFacetsAndSort.activeFacets, ui = activeFacetsAndSort.ui;
    return {
        facetOptions: facetOptions,
        clearAllFilters: clearAllFilters,
        toggleFacet: toggleFacet,
        toggleFacets: toggleFacets,
        onUpdateFacets: onUpdateFacets,
        updateText: updateText,
        clearText: clearText,
        updateSort: updateSort,
        acceptSuggestion: acceptSuggestion,
        loadMore: loadMore,
        incremental: incremental,
        text: text,
        sort: sort,
        activeFacets: activeFacets,
        onSubmit: onSubmit,
        from: from,
        updateUI: updateUI,
        ui: ui
    };
};
