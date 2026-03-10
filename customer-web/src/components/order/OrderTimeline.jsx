import { Check, Clock } from 'lucide-react';
import { getStatusLabel } from '../../utils/helpers';

const STATUS_STEPS = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'assigned',
  'picked_up',
  'on_the_way',
  'delivered',
];

export default function OrderTimeline({ currentStatus, statusHistory = [] }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  const isTerminal = ['cancelled', 'rejected'].includes(currentStatus);

  if (isTerminal) {
    return (
      <div className="bg-red-50 rounded-2xl p-4">
        <p className="text-center font-semibold text-red-600">
          {getStatusLabel(currentStatus)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {STATUS_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={step} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDone ? 'bg-green-500' : isCurrent ? 'bg-primary-500' : 'bg-gray-200'
            }`}>
              {isDone ? (
                <Check className="w-4 h-4 text-white" />
              ) : isCurrent ? (
                <Clock className="w-4 h-4 text-white animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              )}
            </div>
            <span className={`text-sm ${isFuture ? 'text-gray-400' : isCurrent ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
              {getStatusLabel(step)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
