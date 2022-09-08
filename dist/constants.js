"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COURSENUM_SORT_FIELD = exports.INITIAL_FACET_STATE = exports.LR_TYPE_ALL = exports.LearningResourceType = void 0;
var LearningResourceType;
(function (LearningResourceType) {
    LearningResourceType["Course"] = "course";
    LearningResourceType["Program"] = "program";
    LearningResourceType["Userlist"] = "userlist";
    LearningResourceType["LearningPath"] = "learningpath";
    LearningResourceType["Video"] = "video";
    LearningResourceType["Podcast"] = "podcast";
    LearningResourceType["PodcastEpisode"] = "podcastepisode";
    LearningResourceType["PseudoList"] = "favorites";
    LearningResourceType["ResourceFile"] = "resourcefile";
    LearningResourceType["Post"] = "post";
    LearningResourceType["Comment"] = "comment";
    LearningResourceType["Profile"] = "profile";
})(LearningResourceType = exports.LearningResourceType || (exports.LearningResourceType = {}));
exports.LR_TYPE_ALL = [
    LearningResourceType.Course,
    LearningResourceType.Program,
    LearningResourceType.Userlist,
    LearningResourceType.LearningPath,
    LearningResourceType.Video,
    LearningResourceType.Podcast,
    LearningResourceType.PodcastEpisode
];
exports.INITIAL_FACET_STATE = {
    audience: [],
    certification: [],
    offered_by: [],
    topics: [],
    type: [],
    department_name: [],
    level: [],
    course_feature_tags: [],
    resource_type: []
};
exports.COURSENUM_SORT_FIELD = "department_course_numbers.sort_coursenum";
