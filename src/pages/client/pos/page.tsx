'use client'
import logger from '@/utils/logger';

import { useState, useEffect } from 'react'
import { ArrowLeft, LogOut } from 'lucide-react'
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
import { Link } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import API_CONFIG from '@/config/api'

export default function POSPage() {
  const { toast } = useToast()
  const { isStaff, logout } = useAuth()
  
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
  const [lastCartItems, setLastCartItems] = useState([])
  
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/pos/stores`, {
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/pos/categories`, {
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
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/pos/products/category?${params}`, {
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
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/pos/products/search?${params}`, {
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/pos/sales`, {
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
      setLastCartItems([...cart])
      setShowReceipt(true)
      setShowPayment(false)

      // Reset cart
      setCart([])
      setDiscount({ type: null, value: 0 })

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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StoreIcon className="h-5 w-5 text-gray-400" />
              No Store Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              You need to create a store before using the POS.
            </p>
            <Button onClick={fetchStores} variant="outline" className="w-full">
              Refresh Stores
            </Button>
            <Link to="/client/stores" className="block">
              <Button className="w-full">
                <StoreIcon className="mr-2 h-4 w-4" />
                Go to Stores
              </Button>
            </Link>
            <Link to="/client/dashboard" className="block">
              <Button variant="ghost" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {isStaff ? (
            <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Link to="/client/dashboard">
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          )}
          <h1 className="text-xl font-bold">Point of Sale</h1>
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
            <SelectTrigger className="w-[200px] h-8 text-sm">
              <StoreIcon className="h-3 w-3 mr-1 shrink-0" />
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 p-4 overflow-auto min-w-0">
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
        <div className="w-80 xl:w-96 bg-white border-l shadow-lg shrink-0 h-full overflow-hidden">
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
        cartItems={lastCartItems}
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