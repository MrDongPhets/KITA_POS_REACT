'use client'

import { Package, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ProductGrid({ products, onProductClick, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="bg-gray-200 h-32 rounded mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600">No products found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
          onClick={() => onProductClick(product)}
        >
          <CardContent className="p-4">
            {/* Product Image */}
            <div className="bg-gray-100 rounded-lg mb-3 h-32 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Package className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* Product Info */}
            <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-bold text-blue-600">
                ${parseFloat(product.default_price).toFixed(2)}
              </p>
              <Badge 
                variant={product.stock_quantity > product.min_stock_level ? 'secondary' : 'secondary'}
                className="text-xs"
              >
                {product.stock_quantity} {product.unit}
              </Badge>
            </div>

            {/* Add to Cart Button */}
            <Button 
              className="w-full" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onProductClick(product)
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}