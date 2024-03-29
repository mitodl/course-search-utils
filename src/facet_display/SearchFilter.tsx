import React from "react"

interface Props {
  value: string
  labelFunction?: ((value: string) => string | null) | null
  clearFacet: () => void
}

export default function SearchFilter(props: Props) {
  const { value, clearFacet, labelFunction } = props

  return (
    <div className="active-search-filter">
      <div className="active-search-filter-label">
        {labelFunction ? labelFunction(value) : value}
      </div>
      <button
        className="remove-filter-button"
        type="button"
        onClick={clearFacet}
        aria-label="clear filter"
      >
        <span className="material-icons" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  )
}
