import React from 'react';

interface TimeFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ currentFilter, onFilterChange }) => {
  const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'no-time', label: '无时间' },
    { value: 'has-time', label: '有时间' },
    { value: 'today', label: '今天' },
    { value: 'yesterday', label: '昨天' },
    { value: 'this-week', label: '本周' },
    { value: 'this-month', label: '本月' },
    { value: 'this-year', label: '今年' },
  ];

  return (
    <div className="time-filter">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="filter-select"
      >
        {filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeFilter;
