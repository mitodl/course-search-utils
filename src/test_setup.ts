// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Enzyme from "enzyme"
import Adapter from "enzyme-adapter-react-16"

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("jest-fetch-mock").enableMocks()

Enzyme.configure({ adapter: new Adapter() })

class Location {
  constructor() {
    this.href = ""
    this.search = ""
  }
}

Object.defineProperty(window, "location", {
  // this is a hack just to be able to assert in tests that window.location
  // has been set to a value
  set: value => {
    if (!value.startsWith("http")) {
      value = `http://fake${value}`
    }
    window._location = value
  },

  get: () => {
    if (window._location) {
      return new URL(window._location)
    } else {
      const location = new Location()
      window._location = location
      return location
    }
  }
})

process.env = {
  ...process.env,
  SEARCH_API_URL: "http://search-the-planet.example.com/search"
}
