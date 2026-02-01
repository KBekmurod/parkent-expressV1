const FilterDropdown = ({ label, value, onChange, options }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default FilterDropdown
