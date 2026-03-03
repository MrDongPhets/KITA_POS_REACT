// src/components/store/SimpleStoreSelector.jsx - No context dependency

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  CheckCircle
} from "lucide-react"

export function SimpleStoreSelector({
  stores = [],
  selectedStore = null,
  onStoreSelect = null,
  viewMode = null,
  onToggleViewMode = null,
  loading = false,
  className = ""
}) {
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading stores...</span>
      </div>
    )
  }

  if (stores.length <= 1) {
    // Single store - just show store name
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-gray-900">
          {stores[0]?.name || 'Main Store'}
        </span>
        <Badge variant="secondary" className="text-xs">
          Single Store
        </Badge>
      </div>
    )
  }

  // Multiple stores - show selector
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
      
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleViewMode}
          className="h-8 text-xs"
        >
          {viewMode === 'all' ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              All Stores
            </>
          ) : (
            'View All Stores'
          )}
        </Button>
        
        {viewMode === 'single' && (
          <>
            <span className="text-gray-400">|</span>
            <Select
              value={selectedStore?.id || ''}
              onValueChange={(storeId) => {
                const store = stores.find(s => s.id === storeId)
                onStoreSelect(store)
              }}
            >
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Select store...">
                  {selectedStore ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedStore.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          selectedStore.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {selectedStore.status}
                      </Badge>
                    </div>
                  ) : (
                    'Select store...'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{store.name}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            store.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {store.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ${store.sales?.toFixed(0) || '0'}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Store Count Badge */}
      <Badge variant="outline" className="text-xs">
        {stores.length} store{stores.length !== 1 ? 's' : ''}
      </Badge>
    </div>
  )
}