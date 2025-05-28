import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface PaymentButtonProps {
  gigId: string;
  applicationId: string;
  amount: number;
  onPaymentComplete?: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  gigId,
  applicationId,
  amount,
  onPaymentComplete
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to make payment');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/gigs/${gigId}/applications/${applicationId}/payment`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Redirect to Cashfree payment page
      window.location.href = response.data.paymentUrl;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`px-4 py-2 rounded-md ${
        loading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default PaymentButton; 