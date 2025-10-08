import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const UserMenu: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAdminPanel = () => {
    router.push('/admin');
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <span className="text-lg">
          {isAdmin ? '🛡️' : '👤'}
        </span>
        <span>{user.username}</span>
        <span className="text-xs text-gray-500">({user.role})</span>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-full mt-2 w-48 z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium">{user.username}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              
              {isAdmin && (
                <button
                  onClick={() => {
                    handleAdminPanel();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <span>🛡️</span>
                  <span>Админ панель</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Выйти</span>
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default UserMenu;

