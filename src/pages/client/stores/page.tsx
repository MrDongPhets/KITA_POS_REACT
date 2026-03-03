// src/app/client/stores/page.js
'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { 
  Plus, 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause,
  Building,
  RefreshCw
} from 'lucide-react'
import { toast } from "sonner"
import API_CONFIG from "@/config/api"

export default function ClientStores() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: ''
  })

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/client/stores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStores(data.stores || [])
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to fetch stores')
      }
    } catch (error) {
      console.error('Fetch stores error:', error)
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStores()
    setRefreshing(false)
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/client/stores/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Store request submitted successfully! Waiting for admin approval.')
        setShowRequestDialog(false)
        setFormData({ name: '', address: '', phone: '', description: '' })
        fetchStores()
      } else {
        toast.error(data.error || 'Failed to submit store request')
      }
    } catch (error) {
      console.error('Store request error:', error)
      toast.error('Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        icon: CheckCircle, 
        text: "Active",
        className: "bg-green-100 text-green-800 hover:bg-green-200"
      },
      pending: { 
        icon: Clock, 
        text: "Pending Approval",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      },
      suspended: { 
        icon: Pause, 
        text: "Suspended",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-200"
      },
      cancelled: { 
        icon: XCircle, 
        text: "Rejected",
        className: "bg-red-100 text-red-800 hover:bg-red-200"
      }
    }

    const config = statusConfig[status] || statusConfig.pending
    const IconComponent = config.icon

    return (
      <Badge className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar userType="client" user={user} />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading stores...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar userType="client" user={user} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/client">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Stores</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Request New Store
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request New Store</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Submit a request for a new store. An admin will review and activate your store.
                  </p>
                </DialogHeader>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Store Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter store name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter store address"
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Additional details about the store"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Store className="h-6 w-6 text-blue-600" />
                My Stores
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your store locations • {stores.length} total stores
              </p>
            </div>
          </div>

          {/* Store Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
                    <p className="text-sm text-gray-600">Total Stores</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stores.filter(s => s.status === 'active').length}
                    </p>
                    <p className="text-sm text-gray-600">Active Stores</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stores.filter(s => s.status === 'pending').length}
                    </p>
                    <p className="text-sm text-gray-600">Pending Approval</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stores.filter(s => s.status === 'cancelled').length}
                    </p>
                    <p className="text-sm text-gray-600">Rejected</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stores Grid */}
          {stores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No stores found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any stores yet. Request your first store to get started.
                </p>
                <Button onClick={() => setShowRequestDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Request First Store
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <Card key={store.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{store.name}</CardTitle>
                      </div>
                      {getStatusBadge(store.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {store.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {store.address}
                          </span>
                        </div>
                      )}
                      
                      {store.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {store.phone}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 text-xs text-muted-foreground">
                        Created: {new Date(store.created_at).toLocaleDateString()}
                      </div>

                      {store.status === 'active' && (
                        <div className="pt-2">
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate(`/client/dashboard?store=${store.id}`)}
                          >
                            Access Dashboard
                          </Button>
                        </div>
                      )}

                      {store.status === 'pending' && (
                        <div className="pt-2">
                          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            ⏳ Waiting for admin approval
                          </div>
                        </div>
                      )}

                      {store.status === 'cancelled' && store.settings?.rejection_reason && (
                        <div className="pt-2">
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            ❌ Rejected: {store.settings.rejection_reason}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}