export const wait = (millis: number): Promise<undefined> =>
  new Promise(resolve => setTimeout(resolve, millis))

export const facetMap = new Map([
  [
    "agg_filter_topics",
    {
      doc_count: 11844,
      topics:    {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count:         0,
        buckets:                     [
          { key: "Physics", doc_count: 6568 },
          { key: "Engineering", doc_count: 5600 },
          { key: "Computer Science", doc_count: 5325 },
          { key: "Science", doc_count: 2006 },
          { key: "Economics", doc_count: 1957 },
          { key: "Probability and Statistics", doc_count: 1764 },
          { key: "Media Studies", doc_count: 1607 },
          { key: "Teaching and Education", doc_count: 1170 },
          { key: "Business", doc_count: 939 },
          { key: "Social Science", doc_count: 669 },
          { key: "Humanities", doc_count: 566 },
          { key: "Electrical Engineering", doc_count: 524 },
          { key: "Communication", doc_count: 433 },
          { key: "Mathematics", doc_count: 291 },
          { key: "Fine Arts", doc_count: 285 },
          { key: "Biology", doc_count: 239 },
          { key: "History", doc_count: 213 },
          { key: "Literature", doc_count: 199 },
          { key: "Health and Medicine", doc_count: 184 },
          { key: "Public Administration", doc_count: 173 },
          { key: "Society", doc_count: 166 },
          { key: "Political Science", doc_count: 162 },
          { key: "Systems Engineering", doc_count: 159 },
          { key: "Mechanical Engineering", doc_count: 144 },
          { key: "Anthropology", doc_count: 143 },
          { key: "Philosophy", doc_count: 133 },
          { key: "Earth Science", doc_count: 129 },
          { key: "Chemistry", doc_count: 127 },
          { key: "Visual Arts", doc_count: 125 },
          { key: "Urban Studies", doc_count: 111 },
          { key: "Physical Education and Recreation", doc_count: 106 },
          { key: "Architecture", doc_count: 101 },
          { key: "Management", doc_count: 96 },
          { key: "Sociology", doc_count: 87 },
          { key: "Cognitive Science", doc_count: 83 },
          { key: "Business & Management", doc_count: 81 },
          { key: "Language", doc_count: 75 },
          { key: "Applied Mathematics", doc_count: 74 },
          { key: "Materials Science and Engineering", doc_count: 67 },
          { key: "Data Analysis & Statistics", doc_count: 65 },
          { key: "Biological Engineering", doc_count: 62 },
          { key: "Operations Management", doc_count: 62 },
          { key: "Differential Equations", doc_count: 54 },
          { key: "Aerospace Engineering", doc_count: 53 },
          { key: "Chemical Engineering", doc_count: 52 },
          { key: "Electronics", doc_count: 51 },
          { key: "Civil Engineering", doc_count: 49 },
          { key: "Music", doc_count: 48 },
          { key: "Entrepreneurship", doc_count: 47 },
          { key: "Organizational Behavior", doc_count: 47 },
          { key: "Environmental Engineering", doc_count: 45 },
          { key: "Gender Studies", doc_count: 45 },
          { key: "Energy", doc_count: 44 },
          { key: "Ocean Engineering", doc_count: 42 },
          { key: "Linear Algebra", doc_count: 41 },
          { key: "Linguistics", doc_count: 41 },
          { key: "Psychology", doc_count: 41 },
          { key: "Information Technology", doc_count: 40 },
          { key: "Leadership", doc_count: 40 },
          { key: "The Developing World", doc_count: 40 },
          { key: "Globalization", doc_count: 39 },
          { key: "Social Sciences", doc_count: 38 },
          { key: "Innovation", doc_count: 35 },
          { key: "Algebra and Number Theory", doc_count: 34 },
          { key: "Computation", doc_count: 34 },
          { key: "Finance", doc_count: 34 },
          { key: "Topology and Geometry", doc_count: 34 },
          { key: "Asian Studies", doc_count: 31 },
          { key: "Economics & Finance", doc_count: 31 },
          { key: "Discrete Mathematics", doc_count: 30 },
          { key: "Mathematical Analysis", doc_count: 29 },
          { key: "Calculus", doc_count: 28 },
          { key: "Nuclear Engineering", doc_count: 28 },
          { key: "Public Health", doc_count: 28 },
          { key: "Project Management", doc_count: 27 },
          { key: "Performance Arts", doc_count: 26 },
          { key: "Nanotechnology", doc_count: 25 },
          { key: "Women's Studies", doc_count: 24 },
          { key: "European and Russian Studies", doc_count: 22 },
          { key: "Game Theory", doc_count: 21 },
          { key: "Curriculum and Teaching", doc_count: 20 },
          { key: "Global Poverty", doc_count: 20 },
          { key: "Legal Studies", doc_count: 20 },
          { key: "Anatomy and Physiology", doc_count: 19 },
          { key: "Educational Technology", doc_count: 19 },
          { key: "Supply Chain Management", doc_count: 19 },
          { key: "Biomedicine", doc_count: 16 },
          { key: "Game Design", doc_count: 16 },
          { key: "Sensory-Neural Systems", doc_count: 16 },
          { key: "Biomedical Instrumentation", doc_count: 14 },
          { key: "Marketing", doc_count: 14 },
          { key: "Technology", doc_count: 14 },
          { key: "Health Care Management", doc_count: 13 },
          { key: "Nuclear", doc_count: 13 },
          { key: "Art History", doc_count: 12 },
          { key: "Business Ethics", doc_count: 12 },
          {
            key:       "Industrial Relations and Human Resource Management",
            doc_count: 12
          },
          { key: "Latin and Caribbean Studies", doc_count: 12 },
          { key: "African American Studies", doc_count: 11 },
          { key: "Electricity", doc_count: 11 },
          { key: "Fossil Fuels", doc_count: 10 },
          { key: "Medical Imaging", doc_count: 10 },
          { key: "Pathology and Pathophysiology", doc_count: 10 },
          { key: "Religion", doc_count: 10 },
          { key: "Biomedical Signal and Image Processing", doc_count: 9 },
          { key: "Climate", doc_count: 9 },
          { key: "Real Estate", doc_count: 9 },
          { key: "Accounting", doc_count: 8 },
          { key: "Pharmacology and Toxicology", doc_count: 8 },
          { key: "Spectroscopy", doc_count: 8 },
          { key: "Biomedical Enterprise", doc_count: 7 },
          { key: "Education Policy", doc_count: 7 },
          { key: "Functional Genomics", doc_count: 7 },
          { key: "Geography", doc_count: 7 },
          { key: "Middle Eastern Studies", doc_count: 7 },
          { key: "Renewables", doc_count: 7 },
          { key: "Buildings", doc_count: 6 },
          { key: "Cancer", doc_count: 6 },
          { key: "Mathematical Logic", doc_count: 6 },
          { key: "Combustion", doc_count: 5 },
          { key: "Education & Teacher Training", doc_count: 5 },
          { key: "Higher Education", doc_count: 5 },
          { key: "Archaeology", doc_count: 4 },
          { key: "Health and Exercise Science", doc_count: 4 },
          { key: "Mental Health", doc_count: 4 },
          { key: "Biology & Life Sciences", doc_count: 3 },
          { key: "Cellular and Molecular Medicine", doc_count: 3 },
          { key: "Design", doc_count: 3 },
          { key: "Epidemiology", doc_count: 3 },
          { key: "Fuel Cells", doc_count: 3 },
          { key: "Hydrogen and Alternatives", doc_count: 3 },
          { key: "Speech Pathology", doc_count: 3 },
          { key: "Transportation", doc_count: 3 },
          { key: "Immunology", doc_count: 2 },
          { key: "Indigenous Studies", doc_count: 1 },
          { key: "Math", doc_count: 1 },
          { key: "Social Medicine", doc_count: 1 }
        ]
      }
    }
  ],
  [
    "agg_filter_certification",
    {
      doc_count:     11844,
      certification: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count:         0,
        buckets:                     [{ key: "Certificates", doc_count: 132 }]
      }
    }
  ],
  [
    "agg_filter_audience",
    {
      doc_count: 11844,
      audience:  {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count:         0,
        buckets:                     [
          { key: "Open Content", doc_count: 11838 },
          { key: "Professional Offerings", doc_count: 6 }
        ]
      }
    }
  ],
  [
    "agg_filter_offered_by",
    {
      doc_count:  11844,
      offered_by: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count:         0,
        buckets:                     [
          { key: "OCW", doc_count: 8298 },
          { key: "CBMM", doc_count: 620 },
          { key: "MITx", doc_count: 411 },
          {
            key:       "School of Humanities, Arts, and Social Sciences",
            doc_count: 351
          },
          { key: "Video Productions", doc_count: 318 },
          { key: "Center for International Studies", doc_count: 234 },
          { key: "Open Learning", doc_count: 211 },
          { key: "CSAIL", doc_count: 174 },
          { key: "Arts at MIT", doc_count: 131 },
          { key: "Sloan School of Management", doc_count: 129 },
          { key: "Bootcamps", doc_count: 114 },
          { key: "MIT Press", doc_count: 101 },
          { key: "Physics Technical Services Group", doc_count: 96 },
          { key: "MIT BLOSSOMS", doc_count: 85 },
          { key: "MIT Alumni", doc_count: 79 },
          { key: "MIT Medical", doc_count: 44 },
          { key: "Energy Initiative", doc_count: 33 },
          { key: "MIT Technology Review", doc_count: 31 },
          { key: "Open Learning Library", doc_count: 30 },
          { key: "MIT News", doc_count: 26 },
          { key: "Department of Urban Studies and Planning", doc_count: 24 },
          { key: "Broad Inistitute", doc_count: 10 },
          { key: "MIT LGO", doc_count: 10 },
          { key: "Department of Biology", doc_count: 8 },
          { key: "xPRO", doc_count: 4 }
        ]
      }
    }
  ],
  [
    "type",
    {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count:         0,
      buckets:                     [
        { key: "video", doc_count: 8156 },
        { key: "course", doc_count: 2508 },
        { key: "podcast", doc_count: 1180 }
      ]
    }
  ],
  [
    "topics",
    {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count:         0,
      buckets:                     [
        { key: "Physics", doc_count: 6568 },
        { key: "Engineering", doc_count: 5600 },
        { key: "Computer Science", doc_count: 5325 },
        { key: "Science", doc_count: 2006 },
        { key: "Economics", doc_count: 1957 },
        { key: "Probability and Statistics", doc_count: 1764 },
        { key: "Media Studies", doc_count: 1607 },
        { key: "Teaching and Education", doc_count: 1170 },
        { key: "Business", doc_count: 939 },
        { key: "Social Science", doc_count: 669 },
        { key: "Humanities", doc_count: 566 },
        { key: "Electrical Engineering", doc_count: 524 },
        { key: "Communication", doc_count: 433 },
        { key: "Mathematics", doc_count: 291 },
        { key: "Fine Arts", doc_count: 285 },
        { key: "Biology", doc_count: 239 },
        { key: "History", doc_count: 213 },
        { key: "Literature", doc_count: 199 },
        { key: "Health and Medicine", doc_count: 184 },
        { key: "Public Administration", doc_count: 173 },
        { key: "Society", doc_count: 166 },
        { key: "Political Science", doc_count: 162 },
        { key: "Systems Engineering", doc_count: 159 },
        { key: "Mechanical Engineering", doc_count: 144 },
        { key: "Anthropology", doc_count: 143 },
        { key: "Philosophy", doc_count: 133 },
        { key: "Earth Science", doc_count: 129 },
        { key: "Chemistry", doc_count: 127 },
        { key: "Visual Arts", doc_count: 125 },
        { key: "Urban Studies", doc_count: 111 },
        { key: "Physical Education and Recreation", doc_count: 106 },
        { key: "Architecture", doc_count: 101 },
        { key: "Management", doc_count: 96 },
        { key: "Sociology", doc_count: 87 },
        { key: "Cognitive Science", doc_count: 83 },
        { key: "Business & Management", doc_count: 81 },
        { key: "Language", doc_count: 75 },
        { key: "Applied Mathematics", doc_count: 74 },
        { key: "Materials Science and Engineering", doc_count: 67 },
        { key: "Data Analysis & Statistics", doc_count: 65 },
        { key: "Biological Engineering", doc_count: 62 },
        { key: "Operations Management", doc_count: 62 },
        { key: "Differential Equations", doc_count: 54 },
        { key: "Aerospace Engineering", doc_count: 53 },
        { key: "Chemical Engineering", doc_count: 52 },
        { key: "Electronics", doc_count: 51 },
        { key: "Civil Engineering", doc_count: 49 },
        { key: "Music", doc_count: 48 },
        { key: "Entrepreneurship", doc_count: 47 },
        { key: "Organizational Behavior", doc_count: 47 },
        { key: "Environmental Engineering", doc_count: 45 },
        { key: "Gender Studies", doc_count: 45 },
        { key: "Energy", doc_count: 44 },
        { key: "Ocean Engineering", doc_count: 42 },
        { key: "Linear Algebra", doc_count: 41 },
        { key: "Linguistics", doc_count: 41 },
        { key: "Psychology", doc_count: 41 },
        { key: "Information Technology", doc_count: 40 },
        { key: "Leadership", doc_count: 40 },
        { key: "The Developing World", doc_count: 40 },
        { key: "Globalization", doc_count: 39 },
        { key: "Social Sciences", doc_count: 38 },
        { key: "Innovation", doc_count: 35 },
        { key: "Algebra and Number Theory", doc_count: 34 },
        { key: "Computation", doc_count: 34 },
        { key: "Finance", doc_count: 34 },
        { key: "Topology and Geometry", doc_count: 34 },
        { key: "Asian Studies", doc_count: 31 },
        { key: "Economics & Finance", doc_count: 31 },
        { key: "Discrete Mathematics", doc_count: 30 },
        { key: "Mathematical Analysis", doc_count: 29 },
        { key: "Calculus", doc_count: 28 },
        { key: "Nuclear Engineering", doc_count: 28 },
        { key: "Public Health", doc_count: 28 },
        { key: "Project Management", doc_count: 27 },
        { key: "Performance Arts", doc_count: 26 },
        { key: "Nanotechnology", doc_count: 25 },
        { key: "Women's Studies", doc_count: 24 },
        { key: "European and Russian Studies", doc_count: 22 },
        { key: "Game Theory", doc_count: 21 },
        { key: "Curriculum and Teaching", doc_count: 20 },
        { key: "Global Poverty", doc_count: 20 },
        { key: "Legal Studies", doc_count: 20 },
        { key: "Anatomy and Physiology", doc_count: 19 },
        { key: "Educational Technology", doc_count: 19 },
        { key: "Supply Chain Management", doc_count: 19 },
        { key: "Biomedicine", doc_count: 16 },
        { key: "Game Design", doc_count: 16 },
        { key: "Sensory-Neural Systems", doc_count: 16 },
        { key: "Biomedical Instrumentation", doc_count: 14 },
        { key: "Marketing", doc_count: 14 },
        { key: "Technology", doc_count: 14 },
        { key: "Health Care Management", doc_count: 13 },
        { key: "Nuclear", doc_count: 13 },
        { key: "Art History", doc_count: 12 },
        { key: "Business Ethics", doc_count: 12 },
        {
          key:       "Industrial Relations and Human Resource Management",
          doc_count: 12
        },
        { key: "Latin and Caribbean Studies", doc_count: 12 },
        { key: "African American Studies", doc_count: 11 },
        { key: "Electricity", doc_count: 11 },
        { key: "Fossil Fuels", doc_count: 10 },
        { key: "Medical Imaging", doc_count: 10 },
        { key: "Pathology and Pathophysiology", doc_count: 10 },
        { key: "Religion", doc_count: 10 },
        { key: "Biomedical Signal and Image Processing", doc_count: 9 },
        { key: "Climate", doc_count: 9 },
        { key: "Real Estate", doc_count: 9 },
        { key: "Accounting", doc_count: 8 },
        { key: "Pharmacology and Toxicology", doc_count: 8 },
        { key: "Spectroscopy", doc_count: 8 },
        { key: "Biomedical Enterprise", doc_count: 7 },
        { key: "Education Policy", doc_count: 7 },
        { key: "Functional Genomics", doc_count: 7 },
        { key: "Geography", doc_count: 7 },
        { key: "Middle Eastern Studies", doc_count: 7 },
        { key: "Renewables", doc_count: 7 },
        { key: "Buildings", doc_count: 6 },
        { key: "Cancer", doc_count: 6 },
        { key: "Mathematical Logic", doc_count: 6 },
        { key: "Combustion", doc_count: 5 },
        { key: "Education & Teacher Training", doc_count: 5 },
        { key: "Higher Education", doc_count: 5 },
        { key: "Archaeology", doc_count: 4 },
        { key: "Health and Exercise Science", doc_count: 4 },
        { key: "Mental Health", doc_count: 4 },
        { key: "Biology & Life Sciences", doc_count: 3 },
        { key: "Cellular and Molecular Medicine", doc_count: 3 },
        { key: "Design", doc_count: 3 },
        { key: "Epidemiology", doc_count: 3 },
        { key: "Fuel Cells", doc_count: 3 },
        { key: "Hydrogen and Alternatives", doc_count: 3 },
        { key: "Speech Pathology", doc_count: 3 },
        { key: "Transportation", doc_count: 3 },
        { key: "Immunology", doc_count: 2 },
        { key: "Indigenous Studies", doc_count: 1 },
        { key: "Math", doc_count: 1 },
        { key: "Social Medicine", doc_count: 1 }
      ]
    }
  ],
  [
    "offered_by",
    {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count:         0,
      buckets:                     [
        { key: "OCW", doc_count: 8298 },
        { key: "CBMM", doc_count: 620 },
        { key: "MITx", doc_count: 411 },
        {
          key:       "School of Humanities, Arts, and Social Sciences",
          doc_count: 351
        },
        { key: "Video Productions", doc_count: 318 },
        { key: "Center for International Studies", doc_count: 234 },
        { key: "Open Learning", doc_count: 211 },
        { key: "CSAIL", doc_count: 174 },
        { key: "Arts at MIT", doc_count: 131 },
        { key: "Sloan School of Management", doc_count: 129 },
        { key: "Bootcamps", doc_count: 114 },
        { key: "MIT Press", doc_count: 101 },
        { key: "Physics Technical Services Group", doc_count: 96 },
        { key: "MIT BLOSSOMS", doc_count: 85 },
        { key: "MIT Alumni", doc_count: 79 },
        { key: "MIT Medical", doc_count: 44 },
        { key: "Energy Initiative", doc_count: 33 },
        { key: "MIT Technology Review", doc_count: 31 },
        { key: "Open Learning Library", doc_count: 30 },
        { key: "MIT News", doc_count: 26 },
        { key: "Department of Urban Studies and Planning", doc_count: 24 },
        { key: "Broad Inistitute", doc_count: 10 },
        { key: "MIT LGO", doc_count: 10 },
        { key: "Department of Biology", doc_count: 8 },
        { key: "xPRO", doc_count: 4 }
      ]
    }
  ],
  [
    "audience",
    {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count:         0,
      buckets:                     [
        { key: "Open Content", doc_count: 11838 },
        { key: "Professional Offerings", doc_count: 6 }
      ]
    }
  ],
  [
    "certification",
    {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count:         0,
      buckets:                     [{ key: "Certificates", doc_count: 132 }]
    }
  ]
])