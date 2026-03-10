'use client';
import { PAYMENT_METHODS } from '../../utils/constants';

export default function PaymentSelector({ selected, onSelect }) {
  const icons = {
    cash: '💵',
    card: '💳',
    payme: '📱',
    click: '📲',
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">To'lov usuli</h3>
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
              selected === method.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-xl">{icons[method.id]}</span>
            <span className="text-sm font-medium text-gray-800">{method.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
