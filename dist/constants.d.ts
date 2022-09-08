import { Facets } from "./url_utils";
export declare enum LearningResourceType {
    Course = "course",
    Program = "program",
    Userlist = "userlist",
    LearningPath = "learningpath",
    Video = "video",
    Podcast = "podcast",
    PodcastEpisode = "podcastepisode",
    PseudoList = "favorites",
    ResourceFile = "resourcefile",
    Post = "post",
    Comment = "comment",
    Profile = "profile"
}
export declare const LR_TYPE_ALL: LearningResourceType[];
export declare const INITIAL_FACET_STATE: Facets;
export declare const COURSENUM_SORT_FIELD = "department_course_numbers.sort_coursenum";
export declare type Level = "Graduate" | "Undergraduate" | null;
