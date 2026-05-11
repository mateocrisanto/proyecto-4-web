/**
 * COMPONENTE: Búsqueda y Filtro Avanzado de Productos
 * Renderiza un formulario de búsqueda con filtros dinámicos
 */

export function SearchFilter({ onFiltersChange, categories, loading }) {
  const e = window.React.createElement;
  const { useState } = window.React;

  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleSearch = () => {
    onFiltersChange({
      q: searchTerm,
      minPrice,
      maxPrice,
      categoria: selectedCategory,
      sort: sortBy
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('');
    setSortBy('newest');
    onFiltersChange({
      q: '',
      minPrice: '',
      maxPrice: '',
      categoria: '',
      sort: 'newest'
    });
  };

  return e(
    'div',
    { className: 'card shadow-sm mb-4' },
    e('div', { className: 'card-body' },
      e('h5', { className: 'card-title mb-3' }, '🔍 Buscar y Filtrar'),
      
      e('div', { className: 'row g-2' },
        // Búsqueda por texto
        e('div', { className: 'col-12 col-md-6' },
          e('input',
            {
              type: 'text',
              className: 'form-control',
              placeholder: 'Buscar por nombre o descripción...',
              value: searchTerm,
              onChange: (evt) => setSearchTerm(evt.target.value),
              onKeyPress: (evt) => evt.key === 'Enter' && handleSearch()
            }
          )
        ),
        
        // Filtro por precio mínimo
        e('div', { className: 'col-12 col-md-3' },
          e('input',
            {
              type: 'number',
              className: 'form-control',
              placeholder: 'Precio mín.',
              value: minPrice,
              onChange: (evt) => setMinPrice(evt.target.value),
              min: '0'
            }
          )
        ),
        
        // Filtro por precio máximo
        e('div', { className: 'col-12 col-md-3' },
          e('input',
            {
              type: 'number',
              className: 'form-control',
              placeholder: 'Precio máx.',
              value: maxPrice,
              onChange: (evt) => setMaxPrice(evt.target.value),
              min: '0'
            }
          )
        )
      ),
      
      e('div', { className: 'row g-2 mt-2' },
        // Filtro por categoría
        e('div', { className: 'col-12 col-md-4' },
          e('select',
            {
              className: 'form-select',
              value: selectedCategory,
              onChange: (evt) => setSelectedCategory(evt.target.value)
            },
            e('option', { value: '' }, '-- Todas las categorías --'),
            Array.isArray(categories) ? categories.map(cat =>
              e('option', { key: cat, value: cat }, cat)
            ) : null
          )
        ),
        
        // Ordenamiento
        e('div', { className: 'col-12 col-md-4' },
          e('select',
            {
              className: 'form-select',
              value: sortBy,
              onChange: (evt) => setSortBy(evt.target.value)
            },
            e('option', { value: 'newest' }, 'Más recientes'),
            e('option', { value: 'price-asc' }, 'Precio: menor a mayor'),
            e('option', { value: 'price-desc' }, 'Precio: mayor a menor'),
            e('option', { value: 'name' }, 'Nombre (A-Z)')
          )
        ),
        
        // Botones
        e('div', { className: 'col-12 col-md-4' },
          e('div', { className: 'btn-group w-100' },
            e('button',
              {
                className: 'btn btn-primary',
                onClick: handleSearch,
                disabled: loading
              },
              loading ? 'Buscando...' : '🔎 Buscar'
            ),
            e('button',
              {
                className: 'btn btn-outline-secondary',
                onClick: handleReset
              },
              'Limpiar'
            )
          )
        )
      )
    )
  );
}
