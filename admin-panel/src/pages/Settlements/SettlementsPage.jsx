import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './SettlementsPage.css';

const SettlementsPage = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/card-payments/settlements/pending');
      setSettlements(response.data.settlements || []);
    } catch (error) {
      console.error('Error fetching settlements:', error);
      toast.error('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (driverId, driverName) => {
    if (!confirm(`Settle all payments for ${driverName}?`)) return;
    
    try {
      const driver = settlements.find(s => s.driver._id === driverId);
      
      for (const payment of driver.payments) {
        await api.put(`/card-payments/${payment._id}/settle`);
      }
      
      toast.success('Payments settled successfully!');
      fetchSettlements();
    } catch (error) {
      console.error('Error settling payments:', error);
      toast.error('Failed to settle payments');
    }
  };

  const getTotalAmount = () => {
    return settlements.reduce((sum, s) => sum + s.totalAmount, 0);
  };

  return (
    <div className="settlements-page">
      <div className="page-header">
        <div className="header-content">
          <DollarSign size={32} className="text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 Hisob-kitob</h1>
            <p className="text-gray-500">Driver payment settlements and tracking</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-label">Total Pending</div>
          <div className="summary-value">{getTotalAmount().toLocaleString()} so'm</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="settlements-container">
          {settlements.length === 0 ? (
            <div className="empty-state">
              <DollarSign size={64} className="text-gray-300" />
              <p className="text-gray-500 mt-4">No pending settlements</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="settlements-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Phone</th>
                    <th>Payments</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map(settlement => (
                    <tr key={settlement.driver._id}>
                      <td className="driver-name">
                        {settlement.driver.firstName} {settlement.driver.lastName}
                      </td>
                      <td>{settlement.driver.phone || 'N/A'}</td>
                      <td>
                        <span className="payment-count-badge">
                          {settlement.payments.length} payment{settlement.payments.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="amount-cell">
                        {settlement.totalAmount.toLocaleString()} so'm
                      </td>
                      <td>
                        <button 
                          className="btn-settle"
                          onClick={() => handleSettle(
                            settlement.driver._id, 
                            `${settlement.driver.firstName} ${settlement.driver.lastName}`
                          )}
                        >
                          ✅ Settle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettlementsPage;
