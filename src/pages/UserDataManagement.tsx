import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

export function UserDataManagement() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<null | 'found' | 'not_found'>(null);

  const handleSearch = () => {
    if (!phone) {
      toast.error('Please enter your phone number.');
      return;
    }
    
    // Simulate searching for user data
    // In a real app, this would hit the backend/supabase
    const ordersData = localStorage.getItem('cafe_orders');
    if (ordersData) {
      const orders = JSON.parse(ordersData);
      const hasData = orders.some((o: any) => o.customerPhone === phone);
      setStatus(hasData ? 'found' : 'not_found');
      if (hasData) {
        toast.success('User data found.');
      } else {
        toast.error('No data found for this phone number.');
      }
    } else {
      setStatus('not_found');
    }
  };

  const handleDelete = () => {
    // Simulate erasing personal data (Right to Erasure)
    const ordersData = localStorage.getItem('cafe_orders');
    if (ordersData) {
      let orders = JSON.parse(ordersData);
      orders = orders.map((o: any) => {
        if (o.customerPhone === phone) {
          return {
            ...o,
            customer: 'Anonymized User',
            customerPhone: null,
            customerAddress: null,
          };
        }
        return o;
      });
      localStorage.setItem('cafe_orders', JSON.stringify(orders));
      toast.success('Your personal data has been securely erased.');
      setStatus(null);
      setPhone('');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf6ec] flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full bg-white p-8 rounded-xl shadow-sm border border-[#ddcfb8]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2c2118]">Data Management</h1>
          <Link to="/">
            <Button variant="outline" size="sm">Back</Button>
          </Link>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          In accordance with the DPDP Act, 2023, you have the right to access and erase your personal data. 
          Enter your phone number below to look up your associated order data.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button onClick={handleSearch}>Lookup Data</Button>
            </div>
          </div>

          {status === 'found' && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">Danger Zone</h3>
              <p className="text-red-600 text-sm mb-4">
                We found orders linked to this phone number. You can request the erasure of your personal data. 
                This action will anonymize your past orders and cannot be undone.
              </p>
              <Button variant="destructive" onClick={handleDelete}>
                Erase My Personal Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
