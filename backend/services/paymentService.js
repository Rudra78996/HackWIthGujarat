import axios from 'axios';

const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

class PaymentService {
  static async createOrder(orderId, amount, customerDetails) {
    try {
      const response = await axios.post(
        `${CASHFREE_API_URL}/orders`,
        {
          order_id: orderId,
          order_amount: amount,
          order_currency: 'INR',
          customer_details: {
            customer_id: customerDetails.id,
            customer_name: customerDetails.name,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone
          },
          order_meta: {
            return_url: `${process.env.FRONTEND_URL}/payment/callback?order_id={order_id}`
          }
        },
        {
          headers: {
            'x-api-version': '2022-09-01',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Cashfree order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  static async verifyPayment(orderId, paymentId) {
    try {
      const response = await axios.get(
        `${CASHFREE_API_URL}/orders/${orderId}/payments/${paymentId}`,
        {
          headers: {
            'x-api-version': '2022-09-01',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error verifying Cashfree payment:', error);
      throw new Error('Failed to verify payment');
    }
  }
}

export default PaymentService; 