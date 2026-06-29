import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fbf6ec] flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full bg-white p-8 rounded-xl shadow-sm border border-[#ddcfb8]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2c2118]">Privacy Policy</h1>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-black mb-2">1. Introduction</h2>
            <p>
              Welcome to the 3D Cafe Management Website. This Privacy Policy outlines how we collect, use, and protect your personal data in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">2. Personal Data Collected</h2>
            <p>
              We collect your name, phone number, and delivery address to process your orders. We process this data only after receiving your explicit, verifiable consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">3. Purpose of Processing</h2>
            <p>
              Your data is processed strictly for the specified purpose of fulfilling your cafe orders, managing inventory, and handling payments securely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">4. Your Rights as a Data Principal</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Right to Information:</strong> You can request a summary of the personal data we hold about you.</li>
              <li><strong>Right to Correction & Erasure:</strong> You can correct inaccuracies or request the deletion of your personal data.</li>
              <li><strong>Right to Grievance Redressal:</strong> You can raise a complaint regarding your data processing.</li>
            </ul>
            <div className="mt-4">
              <Link to="/data-management">
                <Button>Manage Your Data</Button>
              </Link>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-black mb-2">5. Data Fiduciary Contact</h2>
            <p>
              For any privacy-related concerns or to reach our Data Protection Officer, please contact us at privacy@3dcafe.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
