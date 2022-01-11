import { Facets } from "./url_utils"

export enum LearningResourceType {
  Course = "course",
  Program = "program",
  Userlist = "userlist",
  LearningPath = "learningpath",
  Video = "video",
  Podcast = "podcast",
  PodcastEpisode = "podcastepisode",
  PseudoList = "favorites",
  ResourceFile = "resourcefile"
}

export const LR_TYPE_ALL = [
  LearningResourceType.Course,
  LearningResourceType.Program,
  LearningResourceType.Userlist,
  LearningResourceType.LearningPath,
  LearningResourceType.Video,
  LearningResourceType.Podcast,
  LearningResourceType.PodcastEpisode,
  LearningResourceType.ResourceFile
]

export const INITIAL_FACET_STATE: Facets = {
  audience:            [],
  certification:       [],
  offered_by:          [],
  topics:              [],
  type:                [],
  department_name:     [],
  level:               [],
  course_feature_tags: [],
  resource_type:       []
}
