'use client';
import { PAYMENT_METHODS } from '../../utils/constants';

export default function PaymentSelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">To'lov usuli</h3>
      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => method.available && onSelect(method.id)}
            disabled={!method.available}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              !method.available
                ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                : selected === method.id
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{method.icon}</span>
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{method.label}</p>
                {!method.available && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Tez orada
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{method.description}</p>
            </div>
            {method.available && (
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === method.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
              }`}>
                {selected === method.id && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Karta to'lov izoh */}
      {selected === 'card_to_driver' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          <p className="font-medium mb-1">💳 Karta orqali to'lov qanday ishlaydi?</p>
          <p>Buyurtma berilgandan so'ng Telegram orqali admin bilan bog'lanishingiz uchun havola taqdim etiladi. Admin karta raqamini yuboradi va siz to'lovni amalga oshirasiz.</p>
        </div>
      )}
    </div>
  );
}
