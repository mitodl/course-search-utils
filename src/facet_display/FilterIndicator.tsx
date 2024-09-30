import React from "react"
import { RiCloseLine } from "@remixicon/react"

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
        <RiCloseLine />
      </button>
    </div>
  )
}
export type { FilterIndicatorProps }
