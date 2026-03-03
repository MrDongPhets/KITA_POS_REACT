'use client'
import logger from '@/utils/logger';

import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Package, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import ProductSearch from './components/ProductSearch'
import CategoryFilter from './components/CategoryFilter'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'
import PaymentModal from './components/PaymentModal'
import DiscountModal from './components/DiscountModal'
import ReceiptModal from './components/ReceiptModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Store as StoreIcon } from "lucide-react"

export default function POSPage() {
  const { toast } = useToast()
  
  // State
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [discount, setDiscount] = useState({ type: null, value: 0 })
  const [loading, setLoading] = useState(false)
  
  // Modals
  const [showPayment, setShowPayment] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState(null)
  
  // Stats
  const [todayStats, setTodayStats] = useState({
    sales: 0,
    total: 0,
    items: 0
  })

  // ✅ Helper function for API calls
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  })

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    if (selectedStore) {
      fetchCategories()
      fetchProducts()
      fetchTodayStats()
    }
  }, [selectedStore, selectedCategory])

  useEffect(() => {
    if (selectedStore) {
      setCart([])
      setDiscount({ type: null, value: 0 })
    }
  }, [selectedStore?.id])

  const fetchStores = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/client/stores`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      logger.log('📍 Stores fetched:', data.stores?.length)
      setStores(data.stores || [])
      if (data.stores?.length > 0) {
        setSelectedStore(data.stores[0])
        logger.log('✅ Auto-selected store:', data.stores[0].name, data.stores[0].id)
      }
    } catch (error) {
      logger.error('Fetch stores error:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/client/categories`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      logger.log('🏷️ Categories fetched:', data.categories?.length)
      setCategories(data.categories || [])
    } catch (error) {
      logger.error('Fetch categories error:', error)
    }
  }

  const fetchProducts = async () => {
    if (!selectedStore) return
    
    try {
      setLoading(true)
      const params = new URLSearchParams({
        store_id: selectedStore.id,
        category_id: selectedCategory
      })
      
      logger.log('📦 Fetching products for store:', selectedStore.id, 'category:', selectedCategory)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pos/products/category?${params}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        logger.error('❌ Products fetch failed:', response.status)
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      logger.log('✅ Products fetched:', data.products?.length)
      setProducts(data.products || [])
    } catch (error) {
      logger.error('Fetch products error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayStats = async () => {
    if (!selectedStore) return
    
    try {
      logger.log('📊 Fetching today stats for store:', selectedStore.id)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pos/sales/today?store_id=${selectedStore.id}`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        logger.error('❌ Today stats fetch failed:', response.status)
        return
      }
      
      const data = await response.json()
      logger.log('✅ Today stats:', data)
      setTodayStats({
        sales: data.count || 0,
        total: data.total || 0,
        items: data.sales?.reduce((sum, sale) => sum + sale.items_count, 0) || 0
      })
    } catch (error) {
      logger.error('Fetch today stats error:', error)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.length < 2) {
      fetchProducts()
      return
    }

    if (!selectedStore) return

    try {
      const params = new URLSearchParams({
        query,
        store_id: selectedStore.id
      })
      
      logger.log('🔍 Searching:', query, 'in store:', selectedStore.id)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pos/products/search?${params}`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      logger.log('✅ Search results:', data.products?.length)
      setProducts(data.products || [])
    } catch (error) {
      logger.error('Search error:', error)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        toast({
          title: "Stock Limit",
          description: "Cannot add more than available stock",
          variant: "destructive"
        })
        return
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.default_price,
        quantity: 1,
        barcode: product.barcode,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        discount_amount: 0,
        discount_percent: 0
      }])
    }
  }

  const updateQuantity = (product_id, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.product_id !== product_id))
    } else {
      const item = cart.find(i => i.product_id === product_id)
      if (item && newQuantity > item.stock_quantity) {
        toast({
          title: "Stock Limit",
          description: "Cannot exceed available stock",
          variant: "destructive"
        })
        return
      }
      setCart(cart.map(item =>
        item.product_id === product_id
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const removeFromCart = (product_id) => {
    setCart(cart.filter(item => item.product_id !== product_id))
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.price * item.quantity - (item.discount_amount || 0)), 0
    )
    
    let discount_amount = 0
    if (discount.type === 'percentage') {
      discount_amount = (subtotal * discount.value) / 100
    } else if (discount.type === 'fixed') {
      discount_amount = discount.value
    }

    return {
      subtotal,
      discount_amount,
      total: subtotal - discount_amount,
      items_count: cart.reduce((sum, item) => sum + item.quantity, 0)
    }
  }

  const handlePayment = async (paymentMethod, customerInfo) => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart first",
        variant: "destructive"
      })
      return
    }

    if (!selectedStore) {
      toast({
        title: "No Store Selected",
        description: "Please select a store first",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const totals = calculateTotals()

      logger.log('💳 Processing payment:', {
        store_id: selectedStore.id,
        items: cart.length,
        total: totals.total
      })

      // ✅ FIXED: Use correct API URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pos/sales`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          store_id: selectedStore.id,
          items: cart,
          payment_method: paymentMethod,
          subtotal: totals.subtotal,
          discount_amount: totals.discount_amount,
          discount_type: discount.type,
          total_amount: totals.total,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          notes: customerInfo.notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        logger.error('❌ Payment failed:', errorData)
        throw new Error(errorData.error || 'Payment failed')
      }

      const data = await response.json()
      logger.log('✅ Payment successful:', data.receipt_number)
      
      setLastSale(data.sale)
      setShowReceipt(true)
      setShowPayment(false)
      
      // Reset cart
      setCart([])
      setDiscount({ type: null, value: 0 })
      
      // Refresh stats
      fetchTodayStats()
      
      toast({
        title: "Sale Completed",
        description: `Receipt: ${data.receipt_number}`
      })
    } catch (error) {
      logger.error('Payment error:', error)
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Store Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please create a store first to use POS.</p>
            <Button 
              onClick={fetchStores}
              className="mt-4 w-full"
            >
              Refresh Stores
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Point of Sale</h1>
            <div className="flex items-center gap-2 mt-1">
              {/* ✅ ADD STORE SELECTOR */}
              <Select 
                value={selectedStore?.id} 
                onValueChange={(storeId) => {
                  const store = stores.find(s => s.id === storeId)
                  if (store) {
                    setSelectedStore(store)
                    logger.log('🔄 Switched to store:', store.name)
                  }
                }}
              >
                <SelectTrigger className="w-[250px] h-8 text-sm">
                  <StoreIcon className="h-3 w-3 mr-2" />
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      <div className="flex items-center gap-2">
                        <StoreIcon className="h-3 w-3" />
                        <span>{store.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Today Stats */}
        <div className="flex gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Today's Sales</p>
                  <p className="text-lg font-bold">{todayStats.sales}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Today's Revenue</p>
                  <p className="text-lg font-bold">${todayStats.total.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Items Sold</p>
                  <p className="text-lg font-bold">{todayStats.items}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Search */}
          <ProductSearch 
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />

          {/* Categories */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Products Grid */}
          <ProductGrid
            products={products}
            onProductClick={addToCart}
            loading={loading}
          />
        </div>

        {/* Right Panel - Cart */}
        <div className="w-96 bg-white border-l shadow-lg">
          <Cart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            subtotal={totals.subtotal}
            discount={totals.discount_amount}
            total={totals.total}
            itemsCount={totals.items_count}
            onApplyDiscount={() => setShowDiscount(true)}
            onCheckout={() => setShowPayment(true)}
            hasDiscount={discount.type !== null}
            onClearCart={() => setCart([])}
          />
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSubmit={handlePayment}
        total={totals.total}
        loading={loading}
      />

      <DiscountModal
        open={showDiscount}
        onClose={() => setShowDiscount(false)}
        onApply={(type, value) => {
          setDiscount({ type, value })
          setShowDiscount(false)
        }}
        currentDiscount={discount}
        subtotal={totals.subtotal}
      />

      <ReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        sale={lastSale}
        store={selectedStore}
        onNewSale={() => {
          setShowReceipt(false)
          setCart([])
          setDiscount({ type: null, value: 0 })
        }}
      />
    </div>
  )
}