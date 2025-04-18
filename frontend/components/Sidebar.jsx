import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [userName, setUserName] = useState('');
  const [activePath, setActivePath] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;

  // Speichern und Wiederherstellen des aktiven Pfads
  useEffect(() => {
    const currentPath = location.pathname;
    localStorage.setItem('activePath', currentPath);
    setActivePath(currentPath);
  }, [location.pathname]);

  // Beim ersten Laden den gespeicherten Pfad wiederherstellen
  useEffect(() => {
    const savedPath = localStorage.getItem('activePath');
    if (savedPath) {
      setActivePath(savedPath);
    } else {
      setActivePath(location.pathname);
    }
  }, []);

  useEffect(() => {
    // Fetch user data to display the name
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      const user_id = localStorage.getItem('user_id');
      
      if (!token || !user_id) return;
      
      try {
        const response = await fetch(`${API_URL}/api/users/${user_id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User data received:", userData); // Debug output
          
          const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
          setUserName(fullName || userData.email);
          
          // Check if is_staff exists and set it
          console.log("is_staff value:", userData.is_staff); // Debug output
          setIsStaff(userData.is_staff === true);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [API_URL]);
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  // Menu items with appropriate icons
  const menuItems = [
    { path: '/flightlog', icon: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', label: 'Flight Log' },
    { path: '/AircraftList', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Aircraft List' },
    { path: '/UserSettings', icon: 'M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495', label: 'User Settings' }
  ];
  
  console.log("isStaff state:", isStaff); // Debug output
  
  // Add Admin link only for staff users
  if (isStaff) {
    console.log("Adding admin menu item"); // Debug output
    menuItems.push({ 
      path: '/admin', 
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', 
      label: 'Admin Panel' 
    });
  }

  // Dynamically add Aircraft Settings if on the Aircraft Settings or Edit Aircraft page
  if (activePath.startsWith('/aircraft-settings/') || activePath.startsWith('/edit-aircraft/')) {
    menuItems.push({
      path: activePath,
      icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z', // Provided SVG path
      label: 'Aircraft Settings'
    });
  }
  
  // Dynamically add Flight Details if on the Flight Details page
  if (activePath.includes('/flightdetails/')) {
    menuItems.push({
      path: activePath,
      icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317-.158.69-.158 1.006 0z',
      label: 'Flight Details'
    });
  }

  return (
    <aside
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transform transition-transform duration-300 ease-in-out fixed w-64 bg-gray-900 text-gray-300 h-full z-10 flex flex-col overflow-y-auto`}
    >
      <div className="p-3 text-lg font-bold border-b border-gray-800 flex items-center">
        <span className="ml-10">UAV Manager</span>
      </div>     
      <nav className="flex-1 py-1">
        {menuItems.map((item) => {
          const isActive = 
            activePath === item.path || 
            activePath === `${item.path}/` ||
            (item.path !== '/' && activePath.startsWith(item.path)) ||
            location.pathname === item.path || 
            location.pathname === `${item.path}/` ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center px-3 py-2 text-sm hover:bg-gray-800 ${
                isActive ? 'bg-blue-600 text-white' : ''
              }`} 
              onClick={() => {
                setActivePath(item.path);
                localStorage.setItem('activePath', item.path);
                toggleSidebar();
              }}
            >
              {item.icon && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {userName && (
        <div className="p-3 border-t border-gray-800">
          <div className="text-center mb-2 text-sm text-gray-400">
            {userName}
          </div>
          <Button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 w-full"
          >
            Log Out
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;