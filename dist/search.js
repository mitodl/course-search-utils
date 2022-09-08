"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDefaultSort = exports.buildSuggestQuery = exports.buildOrQuery = exports.buildFacetSubQuery = exports.buildLearnQuery = exports.buildChannelQuery = exports.buildSearchQuery = exports.emptyOrNil = exports.normalizeDoubleQuotes = exports.isDoubleQuoted = exports.searchFields = exports.channelField = exports.SEARCH_FILTER_PROFILE = exports.SEARCH_FILTER_COMMENT = exports.SEARCH_FILTER_POST = exports.RESOURCEFILE_QUERY_FIELDS = exports.RESOURCE_QUERY_NESTED_FIELDS = exports.LEARN_SUGGEST_FIELDS = void 0;
var bodybuilder_1 = __importDefault(require("bodybuilder"));
var ramda_1 = require("ramda");
var constants_1 = require("./constants");
var PODCAST_QUERY_FIELDS = [
    "title.english^3",
    "short_description.english^2",
    "full_description.english",
    "topics"
];
exports.LEARN_SUGGEST_FIELDS = [
    "title.trigram",
    "short_description.trigram"
];
var CHANNEL_SUGGEST_FIELDS = ["suggest_field1", "suggest_field2"];
var PODCAST_EPISODE_QUERY_FIELDS = [
    "title.english^3",
    "short_description.english^2",
    "full_description.english",
    "topics",
    "series_title^2"
];
var COURSE_QUERY_FIELDS = [
    "title.english^3",
    "short_description.english^2",
    "full_description.english",
    "topics",
    "platform",
    "course_id",
    "offered_by",
    "department_name",
    "course_feature_tags"
];
var VIDEO_QUERY_FIELDS = [
    "title.english^3",
    "short_description.english^2",
    "full_description.english",
    "transcript.english^2",
    "topics",
    "platform",
    "video_id",
    "offered_by"
];
var LIST_QUERY_FIELDS = [
    "title.english^3",
    "short_description.english^2",
    "topics"
];
var POST_QUERY_FIELDS = [
    "text.english",
    "post_title.english",
    "plain_text.english"
];
var COMMENT_QUERY_FIELDS = ["text.english"];
var PROFILE_QUERY_FIELDS = [
    "author_headline.english",
    "author_bio.english",
    "author_name.english"
];
exports.RESOURCE_QUERY_NESTED_FIELDS = [
    "runs.year",
    "runs.semester",
    "runs.level",
    "runs.instructors^5",
    "department_name"
];
exports.RESOURCEFILE_QUERY_FIELDS = [
    "content",
    "title.english^3",
    "short_description.english^2",
    "department_name",
    "resource_type"
];
var OBJECT_TYPE = "type";
var POST_CHANNEL_FIELD = "channel_name";
var COMMENT_CHANNEL_FIELD = "channel_name";
var PROFILE_CHANNEL_FIELD = "author_channel_membership";
exports.SEARCH_FILTER_POST = "post";
exports.SEARCH_FILTER_COMMENT = "comment";
exports.SEARCH_FILTER_PROFILE = "profile";
exports.channelField = function (type) {
    if (type === constants_1.LearningResourceType.Post) {
        return POST_CHANNEL_FIELD;
    }
    else if (type === constants_1.LearningResourceType.Comment) {
        return COMMENT_CHANNEL_FIELD;
    }
    else if (type === constants_1.LearningResourceType.Profile) {
        return PROFILE_CHANNEL_FIELD;
    }
    else {
        throw new Error("Missing type");
    }
};
exports.searchFields = function (type) {
    switch (type) {
        case constants_1.LearningResourceType.Course:
            return COURSE_QUERY_FIELDS;
        case constants_1.LearningResourceType.Video:
            return VIDEO_QUERY_FIELDS;
        case constants_1.LearningResourceType.Podcast:
            return PODCAST_QUERY_FIELDS;
        case constants_1.LearningResourceType.PodcastEpisode:
            return PODCAST_EPISODE_QUERY_FIELDS;
        case constants_1.LearningResourceType.ResourceFile:
            return exports.RESOURCEFILE_QUERY_FIELDS;
        case constants_1.LearningResourceType.Comment:
            return COMMENT_QUERY_FIELDS;
        case constants_1.LearningResourceType.Post:
            return POST_QUERY_FIELDS;
        case constants_1.LearningResourceType.Profile:
            return PROFILE_QUERY_FIELDS;
        case constants_1.LearningResourceType.Program:
        case constants_1.LearningResourceType.Userlist:
        case constants_1.LearningResourceType.LearningPath:
            return LIST_QUERY_FIELDS;
        default:
            return ramda_1.uniq(__spreadArrays(POST_QUERY_FIELDS, COMMENT_QUERY_FIELDS, PROFILE_QUERY_FIELDS));
    }
};
exports.isDoubleQuoted = function (str) {
    return /^".+"$/.test(exports.normalizeDoubleQuotes(str) || "");
};
exports.normalizeDoubleQuotes = function (text) { return (text || "").replace(/[\u201C\u201D]/g, '"'); };
exports.emptyOrNil = ramda_1.either(ramda_1.isEmpty, ramda_1.isNil);
var getTypes = function (activeFacets) {
    if (activeFacets === null || activeFacets === void 0 ? void 0 : activeFacets.type) {
        return activeFacets.type;
    }
    else {
        return [exports.SEARCH_FILTER_COMMENT, exports.SEARCH_FILTER_POST, exports.SEARCH_FILTER_PROFILE];
    }
};
/**
 Generates an elasticsearch query object with nested string parameters from inputs of type SearchQueryParams.
*/
exports.buildSearchQuery = function (_a) {
    var _b, _c;
    var text = _a.text, from = _a.from, size = _a.size, sort = _a.sort, activeFacets = _a.activeFacets, channelName = _a.channelName;
    var builder = bodybuilder_1.default();
    if (!ramda_1.isNil(from)) {
        builder = builder.from(from);
    }
    if (!ramda_1.isNil(size)) {
        builder = builder.size(size);
    }
    if (sort &&
        activeFacets &&
        !((_b = activeFacets.type) !== null && _b !== void 0 ? _b : []).includes(constants_1.LearningResourceType.ResourceFile)) {
        var field = sort.field, option = sort.option;
        var fieldPieces = field.split(".");
        var sortQuery = {
            order: option,
            nested: {
                path: fieldPieces[0]
            }
        };
        if (field === constants_1.COURSENUM_SORT_FIELD) {
            if (((_c = activeFacets.department_name) !== null && _c !== void 0 ? _c : []).length === 0) {
                sortQuery["nested"]["filter"] = {
                    term: {
                        "department_course_numbers.primary": true
                    }
                };
            }
            else {
                var filterClause = [];
                addFacetClauseToArray(filterClause, "department_course_numbers.department", activeFacets.department_name || [], constants_1.LearningResourceType.Course);
                sortQuery["nested"]["filter"] = filterClause[0];
            }
        }
        builder.sort(field, sortQuery);
    }
    var types = getTypes(activeFacets);
    var searchText = exports.normalizeDoubleQuotes(text);
    return exports.emptyOrNil(ramda_1.intersection(__spreadArrays(constants_1.LR_TYPE_ALL, [constants_1.LearningResourceType.ResourceFile]), types)) ?
        exports.buildChannelQuery(builder, searchText, types, channelName) :
        exports.buildLearnQuery(builder, searchText, types, activeFacets);
};
exports.buildChannelQuery = function (builder, text, types, channelName) {
    var _a;
    for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
        var type = types_1[_i];
        var textQuery = exports.emptyOrNil(text) ?
            {} :
            {
                should: [
                    {
                        multi_match: {
                            query: text,
                            fields: exports.searchFields(type)
                        }
                    }
                ].filter(function (clause) { return clause !== null; })
            };
        // If channelName is present add a filter for the type
        var channelClauses = channelName ?
            [
                {
                    term: (_a = {},
                        _a[exports.channelField(type)] = channelName,
                        _a)
                }
            ] :
            [];
        builder = exports.buildOrQuery(builder, type, textQuery, channelClauses);
    }
    if (!exports.emptyOrNil(text)) {
        builder = builder.rawOption("suggest", 
        // @ts-expect-error
        exports.buildSuggestQuery(text, CHANNEL_SUGGEST_FIELDS));
    }
    return builder.build();
};
exports.buildLearnQuery = function (builder, text, types, facets) {
    var _a, _b, _c;
    for (var _i = 0, types_2 = types; _i < types_2.length; _i++) {
        var type = types_2[_i];
        var queryType = exports.isDoubleQuoted(text) ? "query_string" : "multi_match";
        var textQuery = exports.emptyOrNil(text) ?
            {} :
            {
                should: [
                    (_a = {},
                        _a[queryType] = {
                            query: text,
                            fields: exports.searchFields(type)
                        },
                        _a),
                    {
                        wildcard: {
                            coursenum: {
                                value: (text || "").toUpperCase() + "*",
                                boost: 100.0,
                                rewrite: "constant_score"
                            }
                        }
                    },
                    [
                        constants_1.LearningResourceType.Course,
                        constants_1.LearningResourceType.Program
                    ].includes(type) ?
                        {
                            nested: {
                                path: "runs",
                                query: (_b = {},
                                    _b[queryType] = {
                                        query: text,
                                        fields: exports.RESOURCE_QUERY_NESTED_FIELDS
                                    },
                                    _b)
                            }
                        } :
                        null,
                    type === constants_1.LearningResourceType.Course ?
                        {
                            has_child: {
                                type: "resourcefile",
                                query: (_c = {},
                                    _c[queryType] = {
                                        query: text,
                                        fields: exports.RESOURCEFILE_QUERY_FIELDS
                                    },
                                    _c),
                                score_mode: "avg"
                            }
                        } :
                        null
                ]
                    .flat()
                    .filter(function (clause) { return clause !== null; })
            };
        // Add filters for facets if necessary
        var facetClauses = exports.buildFacetSubQuery(facets, builder, type);
        builder = exports.buildOrQuery(builder, type, textQuery, []);
        builder = builder.rawOption("post_filter", {
            bool: {
                must: __spreadArrays(facetClauses)
            }
        });
        // Include suggest if search test is not null/empty
        if (!exports.emptyOrNil(text)) {
            builder = builder.rawOption("suggest", 
            // @ts-expect-error
            exports.buildSuggestQuery(text, exports.LEARN_SUGGEST_FIELDS));
        }
        else if (facetClauses.length === 0 && ramda_1.equals(types, constants_1.LR_TYPE_ALL)) {
            builder = builder.rawOption("sort", exports.buildDefaultSort());
        }
    }
    return builder.build();
};
var buildLevelQuery = function (_builder, values, facetClauses) {
    if (values && values.length > 0) {
        var facetFilter = values.map(function (value) { return ({
            nested: {
                path: "runs",
                query: {
                    match: {
                        "runs.level": value
                    }
                }
            }
        }); });
        facetClauses.push({
            bool: {
                should: facetFilter
            }
        });
    }
};
exports.buildFacetSubQuery = function (facets, builder, objectType) {
    var facetClauses = [];
    if (facets) {
        Object.entries(facets).forEach(function (_a) {
            var key = _a[0], values = _a[1];
            var facetClausesForFacet = [];
            if (values && values.length > 0) {
                if (key === "level") {
                    buildLevelQuery(builder, values, facetClauses);
                }
                else {
                    addFacetClauseToArray(facetClauses, key, values, objectType);
                }
            }
            // $FlowFixMe: we check for null facets earlier
            Object.entries(facets).forEach(function (_a) {
                var otherKey = _a[0], otherValues = _a[1];
                if (otherKey !== key && otherValues && otherValues.length > 0) {
                    if (otherKey === "level") {
                        buildLevelQuery(builder, otherValues, facetClausesForFacet);
                    }
                    else {
                        addFacetClauseToArray(facetClausesForFacet, otherKey, otherValues, objectType);
                    }
                }
            });
            if (facetClausesForFacet.length > 0) {
                var filter_1 = {
                    filter: {
                        bool: {
                            must: __spreadArrays(facetClausesForFacet)
                        }
                    }
                };
                if (key === "level") {
                    // this is done seperately b/c it's a nested field
                    builder.agg("filter", key, function (aggr) {
                        return aggr
                            .orFilter("bool", filter_1)
                            .agg("nested", { path: "runs" }, "level", function (aggr) {
                            return aggr.agg("terms", "runs.level", { size: 10000 }, "level", function (aggr) { return aggr.agg("reverse_nested", null, {}, "courses"); });
                        });
                    });
                }
                else {
                    builder.agg("filter", key, function (aggregation) {
                        return aggregation
                            .orFilter("bool", filter_1)
                            .agg("terms", key === OBJECT_TYPE ? "object_type.keyword" : key, { size: 10000 }, key);
                    });
                }
            }
            else {
                if (key === "level") {
                    // this is done seperately b/c it's a nested field
                    builder.agg("nested", { path: "runs" }, "level", function (aggr) {
                        return aggr.agg("terms", "runs.level", {
                            size: 10000
                        }, "level", function (aggr) { return aggr.agg("reverse_nested", null, {}, "courses"); });
                    });
                }
                else {
                    builder.agg("terms", key === OBJECT_TYPE ? "object_type.keyword" : key, { size: 10000 }, key);
                }
            }
        });
    }
    return facetClauses;
};
exports.buildOrQuery = function (builder, searchType, textQuery, extraClauses) {
    var textFilter = exports.emptyOrNil(textQuery) ? [] : [{ bool: textQuery }];
    builder = builder.orQuery("bool", __assign({ filter: {
            bool: {
                must: __spreadArrays([
                    {
                        term: {
                            object_type: searchType
                        }
                    }
                ], extraClauses, textFilter)
            }
        } }, textQuery));
    return builder;
};
var addFacetClauseToArray = function (facetClauses, facet, values, type) {
    if (facet === OBJECT_TYPE &&
        values.toString() === exports.buildSearchQuery.toString()) {
        return;
    }
    var filterKey = facet === OBJECT_TYPE ? "object_type.keyword" : facet;
    var valueClauses;
    // Apply standard facet clause unless this is an offered_by facet for resources.
    if (facet !== "offered_by" || type !== constants_1.LearningResourceType.ResourceFile) {
        valueClauses = values.map(function (value) {
            var _a;
            return ({
                term: (_a = {},
                    _a[filterKey] = value,
                    _a)
            });
        });
    }
    else {
        // offered_by facet should apply to parent doc of resource
        valueClauses = [
            {
                has_parent: {
                    parent_type: "resource",
                    query: {
                        bool: {
                            should: values.map(function (value) {
                                var _a;
                                return ({
                                    term: (_a = {},
                                        _a[filterKey] = value,
                                        _a)
                                });
                            })
                        }
                    }
                }
            }
        ];
    }
    facetClauses.push({
        bool: {
            should: valueClauses
        }
    });
};
exports.buildSuggestQuery = function (text, suggestFields) {
    var suggest = {
        text: text
    };
    suggestFields.forEach(function (field) {
        return (suggest[field] = {
            phrase: {
                field: "" + field,
                size: 5,
                gram_size: 1,
                confidence: 0.0001,
                max_errors: 3,
                collate: {
                    query: {
                        source: {
                            match_phrase: {
                                "{{field_name}}": "{{suggestion}}"
                            }
                        }
                    },
                    params: { field_name: "" + field },
                    prune: true
                }
            }
        });
    });
    return suggest;
};
exports.buildDefaultSort = function () {
    return [
        { minimum_price: { order: "asc" } },
        { default_search_priority: { order: "desc" } },
        { created: { order: "desc" } }
    ];
};
