type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type AppProFilterTabsProps<T extends string> = {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
};

export function AppProFilterTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: AppProFilterTabsProps<T>) {
  return (
    <div className="document-filters app-pro-filter-tabs" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? 'document-filter active' : 'document-filter'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
