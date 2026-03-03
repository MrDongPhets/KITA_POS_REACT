'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Lock, Store, AlertCircle } from 'lucide-react';
import API_CONFIG from '@/config/api';

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [credentials, setCredentials] = useState({
    staff_id: '',
    passcode: '',
    store_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/staff/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'staff');
      localStorage.setItem('staffData', JSON.stringify(data.staff));

      // Redirect to POS
      navigate('/pos');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Number pad for PIN entry
  const handlePinClick = (num) => {
    if (credentials.passcode.length < 6) {
      setCredentials(prev => ({
        ...prev,
        passcode: prev.passcode + num
      }));
    }
  };

  const handlePinClear = () => {
    setCredentials(prev => ({ ...prev, passcode: '' }));
  };

  const handlePinBackspace = () => {
    setCredentials(prev => ({
      ...prev,
      passcode: prev.passcode.slice(0, -1)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Staff Login</CardTitle>
          <CardDescription>Enter your credentials to access POS</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Staff ID */}
            <div className="space-y-2">
              <Label htmlFor="staff_id">Staff ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="staff_id"
                  type="text"
                  placeholder="Enter your staff ID"
                  className="pl-10"
                  value={credentials.staff_id}
                  onChange={(e) => setCredentials(prev => ({ ...prev, staff_id: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Store ID */}
            <div className="space-y-2">
              <Label htmlFor="store_id">Store</Label>
              <div className="relative">
                <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="store_id"
                  type="text"
                  placeholder="Enter store ID"
                  className="pl-10"
                  value={credentials.store_id}
                  onChange={(e) => setCredentials(prev => ({ ...prev, store_id: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* PIN Passcode */}
            <div className="space-y-2">
              <Label htmlFor="passcode">PIN Code</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="passcode"
                  type="password"
                  placeholder="Enter 4-6 digit PIN"
                  className="pl-10 text-center text-2xl tracking-widest"
                  value={credentials.passcode}
                  readOnly
                  maxLength={6}
                />
              </div>
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant="outline"
                  className="h-14 text-xl font-semibold"
                  onClick={() => handlePinClick(num)}
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-14"
                onClick={handlePinClear}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-14 text-xl font-semibold"
                onClick={() => handlePinClick(0)}
              >
                0
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-14"
                onClick={handlePinBackspace}
              >
                ←
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login to POS'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <a href="/login" className="text-blue-600 hover:underline">
              Manager Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}