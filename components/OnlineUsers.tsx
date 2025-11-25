import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

const OnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch('/api/online-users');
        if (response.ok) {
          const data = await response.json();
          setOnlineCount(data.onlineUsers);
        }
      } catch (error) {
        console.error('Failed to fetch online users:', error);
      }
    };

    fetchOnlineUsers(); // Fetch immediately
    const interval = setInterval(fetchOnlineUsers, 15000); // And then every 15 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-gray-600" title={`${onlineCount} usuarios en línea`}>
      <div className="relative flex h-3 w-3 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </div>
      <span className="font-bold">{onlineCount}</span>
      <span className="hidden sm:inline">en línea</span>
    </div>
  );
};

export default OnlineUsers;
