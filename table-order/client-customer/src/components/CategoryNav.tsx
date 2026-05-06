

interface Category {
  id: number;
  name: string;
}

interface Props {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function CategoryNav({ categories, selectedId, onSelect }: Props) {
  return (
    <nav className="category-nav" data-testid="category-nav">
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`category-tab ${selectedId === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
          data-testid={`category-tab-${cat.id}`}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
