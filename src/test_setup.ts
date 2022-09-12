// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Enzyme from "enzyme"
import Adapter from "enzyme-adapter-react-16"

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("jest-fetch-mock").enableMocks()

Enzyme.configure({ adapter: new Adapter() })

process.env = {
  ...process.env,
  SEARCH_API_URL: "http://search-the-planet.example.com/search"
}
