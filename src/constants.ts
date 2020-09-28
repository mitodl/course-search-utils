import { Facets } from "./url_utils"

export const LR_TYPE_COURSE = "course"
export const LR_TYPE_PROGRAM = "program"
export const LR_TYPE_USERLIST = "userlist"
export const LR_TYPE_LEARNINGPATH = "learningpath"
export const LR_TYPE_VIDEO = "video"
export const LR_TYPE_PODCAST = "podcast"
export const LR_TYPE_PODCAST_EPISODE = "podcastepisode"
export const FAVORITES_PSEUDO_LIST = "favorites"
export const LR_TYPE_RESOURCEFILE = "resourcefile"

export const LR_TYPE_ALL = [
  LR_TYPE_COURSE,
  LR_TYPE_PROGRAM,
  LR_TYPE_USERLIST,
  LR_TYPE_LEARNINGPATH,
  LR_TYPE_VIDEO,
  LR_TYPE_PODCAST,
  LR_TYPE_PODCAST_EPISODE,
  LR_TYPE_RESOURCEFILE
]

export const INITIAL_FACET_STATE: Facets = {
  audience:        [],
  certification:   [],
  offered_by:      [],
  topics:          [],
  type:            [],
  department_name: []
}
