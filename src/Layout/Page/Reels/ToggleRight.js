import { ChevronUp, ChevronDown } from 'lucide-react';

export function ToggleRight({ handlePreviousReel, handleNextReel }) {
  return (
    <div className='absolute right-4 flex flex-col space-y-4'>
      <button
        className="bg-gray-700 rounded-full p-3"
        onClick={handlePreviousReel}
      >
        <ChevronUp className="w-6 h-6 text-white" />
      </button>
      <button
        className="bg-gray-700 rounded-full p-3"
        onClick={handleNextReel}
      >
        <ChevronDown className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}