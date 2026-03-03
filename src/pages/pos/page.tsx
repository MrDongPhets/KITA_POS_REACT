'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, User } from 'lucide-react';

export default function POSPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    // Check if staff is logged in
    const userType = localStorage.getItem('userType');
    const staffData = localStorage.getItem('staffData');

    if (userType !== 'staff' || !staffData) {
      navigate('/staff/login');
      return;
    }

    setStaff(JSON.parse(staffData));
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('staffData');
    navigate('/staff/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">POS System</h1>
            <p className="text-sm text-gray-600">{staff?.name} - {staff?.role}</p>
          </div>
        </div>

        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Main POS Content */}
      <div className="flex-1 p-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">POS Interface Coming Soon</h2>
          <p className="text-gray-600 mb-4">
            Staff ID: {staff?.staff_id}<br />
            Store: {staff?.store_id}
          </p>
          <p className="text-sm text-gray-500">
            Phase 2 will implement the full POS interface with product selection, cart, and checkout.
          </p>
        </Card>
      </div>
    </div>
  );
}