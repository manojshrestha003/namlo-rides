import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

import type {UserRole} from '../types';

const SelectRolePage = () => {
  const { switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: UserRole) => {
    switchRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Choose your role</h2>
          <p className="text-sm text-gray-500 mt-1">
            Open two tabs to simulate both sides
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Rider card */}
          <button
            onClick={() => handleSelect('rider')}
            className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-blue-400 hover:shadow-sm transition-all group"
          >
            <div className="text-3xl mb-3">🧍</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
              Rider
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Request and track rides
            </p>
          </button>

          {/* Driver card */}
          <button
            onClick={() => handleSelect('driver')}
            className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-green-400 hover:shadow-sm transition-all group"
          >
            <div className="text-3xl mb-3">🚗</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
              Driver
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Accept and complete trips
            </p>
          </button>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>

      </div>
    </div>
  );
};

export default SelectRolePage;