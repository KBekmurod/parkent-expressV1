import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './CardPaymentsPage.css';

const CardPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'pending') params.verified = 'false';
      if (filter === 'verified') params.verified = 'true';
      
      const response = await api.get('/card-payments', { params });
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId) => {
    try {
      await api.put(`/card-payments/${paymentId}/verify`, {});
      toast.success('Payment verified!');
      fetchPayments();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await api.put(`/card-payments/${paymentId}/reject`, { reason });
      toast.success('Payment rejected');
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    }
  };

  return (
    <div className="card-payments-page">
      <div className="page-header">
        <div className="header-content">
          <CreditCard size={32} className="text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💳 Karta To'lovlar</h1>
            <p className="text-gray-500">Manage card payment receipts and verification</p>
          </div>
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            Verified
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="payments-grid">
          {payments.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={64} className="text-gray-300" />
              <p className="text-gray-500 mt-4">No card payments found</p>
            </div>
          ) : (
            payments.map(payment => (
              <div 
                key={payment._id} 
                className={`payment-card ${payment.adminVerified ? 'verified' : ''}`}
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="payment-header">
                  <span className="order-number">
                    Order: #{payment.orderId?.orderNumber || 'N/A'}
                  </span>
                  {payment.adminVerified && (
                    <span className="badge verified-badge">✓ Verified</span>
                  )}
                  {payment.settlementStatus === 'disputed' && (
                    <span className="badge disputed-badge">⚠ Disputed</span>
                  )}
                </div>
                
                <div className="payment-details">
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">{payment.amount?.toLocaleString()} so'm</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Driver:</span>
                    <span className="value">
                      {payment.driverId?.firstName} {payment.driverId?.lastName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Customer:</span>
                    <span className="value">
                      {payment.customerId?.firstName} {payment.customerId?.lastName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {payment.receiptPhoto && (
                  <div className="receipt-preview">
                    <img 
                      src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/${payment.receiptPhoto}`} 
                      alt="Receipt" 
                      className="receipt-image"
                    />
                  </div>
                )}

                {!payment.adminVerified && (
                  <div className="action-buttons">
                    <button 
                      className="btn-verify"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleVerify(payment._id); 
                      }}
                    >
                      ✅ Verify
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleReject(payment._id); 
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button className="close-btn" onClick={() => setSelectedPayment(null)}>×</button>
            </div>
            <div className="modal-body">
              {selectedPayment.receiptPhoto && (
                <img 
                  src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/${selectedPayment.receiptPhoto}`} 
                  alt="Receipt" 
                  className="modal-receipt-image"
                />
              )}
              <div className="modal-details">
                <p><strong>Order:</strong> #{selectedPayment.orderId?.orderNumber}</p>
                <p><strong>Amount:</strong> {selectedPayment.amount?.toLocaleString()} so'm</p>
                <p><strong>Driver:</strong> {selectedPayment.driverId?.firstName} {selectedPayment.driverId?.lastName}</p>
                <p><strong>Customer:</strong> {selectedPayment.customerId?.firstName} {selectedPayment.customerId?.lastName}</p>
                <p><strong>Status:</strong> {selectedPayment.settlementStatus}</p>
                <p><strong>Customer Confirmed:</strong> {selectedPayment.customerConfirmed ? 'Yes' : 'No'}</p>
                {selectedPayment.verificationNotes && (
                  <p><strong>Notes:</strong> {selectedPayment.verificationNotes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPaymentsPage;
