import type { Facets } from "./url_utils"

export enum LearningResourceType {
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

export const INITIAL_FACET_STATE: Facets = {
  platform:             [],
  offered_by:           [],
  topic:                [],
  department:           [],
  level:                [],
  course_feature:       [],
  resource_type:        [],
  content_feature_type: []
}

export const LEARNING_RESOURCE_ENDPOINT = "resource"
export const CONTENT_FILE_ENDPOINT = "content_file"

export const COURSENUM_SORT_FIELD = "department_course_numbers.sort_coursenum"

export const DEPARTMENTS = {
  1:       "Civil and Environmental Engineering",
  2:       "Mechanical Engineering",
  3:       "Materials Science and Engineering",
  4:       "Architecture",
  5:       "Chemistry",
  6:       "Electrical Engineering and Computer Science",
  7:       "Biology",
  8:       "Physics",
  9:       "Brain and Cognitive Sciences",
  10:      "Chemical Engineering",
  11:      "Urban Studies and Planning",
  12:      "Earth, Atmospheric, and Planetary Sciences",
  14:      "Economics",
  15:      "Sloan School of Management",
  16:      "Aeronautics and Astronautics",
  17:      "Political Science",
  18:      "Mathematics",
  20:      "Biological Engineering",
  "21A":   "Anthropology",
  "21G":   "Global Studies and Languages",
  "21H":   "History",
  "21L":   "Literature",
  "21M":   "Music and Theater Arts",
  22:      "Nuclear Science and Engineering",
  24:      "Linguistics and Philosophy",
  CC:      "Concourse",
  "CMS-W": "Comparative Media Studies/Writing",
  EC:      "Edgerton Center",
  ES:      "Experimental Study Group",
  ESD:     "Engineering Systems Division",
  HST:     "Health Sciences and Technology",
  IDS:     "Institute for Data, Systems, and Society",
  MAS:     "Media Arts and Sciences",
  PE:      "Athletics, Physical Education and Recreation",
  RES:     "Supplemental Resources",
  STS:     "Science, Technology, and Society",
  WGS:     "Women's and Gender Studies"
}

export const LEVELS = {
  undergraduate: "Undergraduate",
  graduate:      "Graduate",
  high_school:   "High School",
  noncredit:     "Non-Credit",
  advanced:      "Advanced",
  intermediate:  "Intermediate",
  introductory:  "Introductory"
}
