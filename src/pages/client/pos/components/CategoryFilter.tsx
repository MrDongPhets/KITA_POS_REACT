'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => onSelectCategory('all')}
          className="whitespace-nowrap"
        >
          All Products
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => onSelectCategory(category.id)}
            className="whitespace-nowrap"
            style={{
              backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
              borderColor: category.color
            }}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}