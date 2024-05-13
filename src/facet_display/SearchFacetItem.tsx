import React from "react"
import { Bucket } from "./types"

interface Props {
  facet: Bucket
  isChecked: boolean
  onUpdate: React.ChangeEventHandler<HTMLInputElement>
  name: string
  displayKey: string | null
}

export const slugify = (text: string) =>
  text
    .split(" ")
    .map(subString => subString.toLowerCase())
    .join("-")
    .replace(/[\W_]/g, "-")

export function SearchFacetItem(props: Props) {
  const { facet, isChecked, onUpdate, name, displayKey } = props

  const facetId = slugify(`${name}-${facet.key}`)
  return (
    <div className={isChecked ? "facet-visible checked" : "facet-visible"}>
      <input
        type="checkbox"
        id={facetId}
        name={name}
        value={facet.key}
        checked={isChecked}
        onChange={onUpdate}
      />
      <div className="facet-label">
        <label htmlFor={facetId} className={"facet-key"}>
          {displayKey ?? ""}
        </label>
        <div className="facet-count">{facet.doc_count}</div>
      </div>
    </div>
  )
}
