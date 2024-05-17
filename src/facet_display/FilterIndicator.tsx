import React from "react"

interface FilterIndicatorProps {
  label: string
  onClick: () => void
}

/**
 * Indicates that a search filter is active.
 */
export default function FilterIndicator(props: FilterIndicatorProps) {
  const { onClick, label } = props

  return (
    <div className="active-search-filter">
      <div className="active-search-filter-label">{label}</div>
      <button
        className="remove-filter-button"
        type="button"
        onClick={onClick}
        aria-label="clear filter"
      >
        <span className="material-icons" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  )
}
export type { FilterIndicatorProps }
