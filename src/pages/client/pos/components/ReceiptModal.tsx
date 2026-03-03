'use client'

import { Printer, Download, Mail, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

export default function ReceiptModal({ open, onClose, sale, store, onNewSale }) {
  if (!sale) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // TODO: Implement PDF download
    alert('PDF download will be implemented')
  }

  const handleEmail = () => {
    // TODO: Implement email receipt
    alert('Email receipt will be implemented')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Sale Completed! 🎉
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 print:border-0">
          {/* Store Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">{store?.name || 'Store'}</h2>
            {store?.address && (
              <p className="text-sm text-gray-600 mt-1">{store.address}</p>
            )}
            {store?.phone && (
              <p className="text-sm text-gray-600">{store.phone}</p>
            )}
          </div>

          <Separator className="my-4" />

          {/* Receipt Info */}
          <div className="space-y-1 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt #:</span>
              <span className="font-mono font-medium">{sale.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{formatDate(sale.created_at)}</span>
            </div>
            {sale.customer_name && (
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{sale.customer_name}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Items */}
          <div className="space-y-2 mb-4">
            {sale.sales_items?.map((item, index) => (
              <div key={index} className="text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{item.products?.name || 'Product'}</span>
                  <span>${parseFloat(item.total_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs ml-2">
                  <span>{item.quantity} x ${parseFloat(item.unit_price).toFixed(2)}</span>
                  {item.discount_amount > 0 && (
                    <span className="text-green-600">-${parseFloat(item.discount_amount).toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>${parseFloat(sale.subtotal || 0).toFixed(2)}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${parseFloat(sale.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${parseFloat(sale.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment Method:</span>
              <span className="capitalize">{sale.payment_method?.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t">
            <p>Thank you for your purchase!</p>
            <p className="mt-1">Please keep this receipt for your records</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            onClick={onNewSale}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}