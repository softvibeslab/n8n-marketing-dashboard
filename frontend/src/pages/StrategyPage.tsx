/**
 * ===========================================
 * Strategy Page
 * ===========================================
 */

import { useNavigate } from 'react-router-dom';
import { StrategyInputForm } from '../components/StrategyInputForm';

/**
 * Strategy input and management page
 */
export default function StrategyPage() {
  const navigate = useNavigate();

  const handleSuccess = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing Strategy</h1>
        <p className="text-gray-600">Define your marketing strategy and campaign goals</p>
      </div>

      <StrategyInputForm onSuccess={handleSuccess} />
    </div>
  );
}
