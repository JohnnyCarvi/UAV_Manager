import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Alert, Button } from '../components';
import UAVImporter from '../helper/UAVImporter';

const AircraftList = () => {
  const navigate = useNavigate();
  const [aircrafts, setAircrafts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const API_URL = import.meta.env.VITE_API_URL;
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
  };
  
  const [filters, setFilters] = useState({
    drone_name: '',
    manufacturer: '',
    type: '',
    motors: '',
    motor_type: '',
    ldg: '',
    firmware_version: '',
    video_system: '',
    gps: '',
    mag: '',
    baro: '',
    gyro: '',
    acc: ''
  });

  const fetchAircrafts = async () => {
    const token = localStorage.getItem('access_token');
    const user_id = localStorage.getItem('user_id');
    
    if (!token || !user_id) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/uavs/?user=${user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_id');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch aircraft data');
      }
      
      // The flight statistics are now included in the UAV data
      const data = await response.json();
      setAircrafts(data);
    } catch (err) {
      console.error(err);
      setError('Could not load aircraft data.');
    }
  };

  const { handleFileUpload } = UAVImporter({
    setError,
    navigate,
    API_URL,
    getAuthHeaders,
    fetchAircrafts
  });

  useEffect(() => {
    fetchAircrafts();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleNewAircraft = () => {
    navigate('/new-aircraft');
  };

  const handleImportCSV = () => {
    fileInputRef.current.click();
  };

  const handleAircraftClick = (uavId) => {
    navigate(`/aircraft-settings/${uavId}`);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const filteredAircrafts = aircrafts.filter(aircraft => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      
      const aircraftValue = String(aircraft[key] || '').toLowerCase();
      return aircraftValue.includes(filterValue.toLowerCase());
    });
  });

  const formatFlightTime = (seconds) => {
    if (!seconds) return 'N/A';
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  };

  const tableColumns = [
    { header: 'Aircraft', accessor: 'drone_name' },
    { header: 'Manufacturer', accessor: 'manufacturer' },
    { header: 'Type', accessor: 'type' },
    { header: 'Motors', accessor: 'motors' },
    { header: 'Type of Motor', accessor: 'motor_type' },
    { header: 'Flight Time', accessor: 'total_flight_time', format: formatFlightTime },
    { header: 'TO', accessor: 'total_takeoffs' },
    { header: 'LDG', accessor: 'total_landings' },
    { header: 'Firmware', accessor: 'firmware_version' },
    { header: 'Video System', accessor: 'video_system' },
    { header: 'GPS', accessor: 'gps' },
    { header: 'MAG', accessor: 'mag' },
    { header: 'BARO', accessor: 'baro' },
    { header: 'GYRO', accessor: 'gyro' },
    { header: 'ACC', accessor: 'acc' }
  ];

  const handleExportCSV = () => {
    if (aircrafts.length === 0) {
      alert('No aircraft data to export.');
      return;
    }
    
    const headers = [
      'DroneName', 'Manufacturer', 'Type', 'Motors', 'MotorType',
      'Video', 'VideoSystem', 'ESC', 'ESCFirmware', 'Receiver',
      'ReceiverFirmware', 'FlightController', 'Firmware', 'FirmwareVersion',
      'GPS', 'MAG', 'BARO', 'GYRO', 'ACC', 'RegistrationNumber', 'SerialNumber'
    ];
    
    const csvData = aircrafts.map(aircraft => [
      aircraft.drone_name || '',
      aircraft.manufacturer || '',
      aircraft.type || '',
      aircraft.motors || '',
      aircraft.motor_type || '',
      aircraft.video || '',
      aircraft.video_system || '',
      aircraft.esc || '',
      aircraft.esc_firmware || '',
      aircraft.receiver || '',
      aircraft.receiver_firmware || '',
      aircraft.flight_controller || '',
      aircraft.firmware || '',
      aircraft.firmware_version || '',
      aircraft.gps || '',
      aircraft.mag || '',
      aircraft.baro || '',
      aircraft.gyro || '',
      aircraft.acc || '',
      aircraft.registration_number || '',
      aircraft.serial_number || ''
    ]);
    
    csvData.unshift(headers);
    
    const csvContent = csvData.map(row => {
      return row.map(cell => {
        if (cell === null || cell === undefined) {
          return '';
        }
        
        const cellStr = String(cell);
        
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',');
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').substring(0, 15);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `uav-export-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="flex h-screen relative">
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-2 left-2 z-20 bg-gray-800 text-white p-2 rounded-md"
        aria-label="Toggle sidebar for mobile"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <button
        onClick={toggleSidebar}
        className={`hidden lg:block fixed top-2 z-30 bg-gray-800 text-white p-2 rounded-md transition-all duration-300 ${
          sidebarOpen ? 'left-2' : 'left-4'
        }`}
        aria-label="Toggle sidebar for desktop"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div 
        className={`flex-1 flex flex-col w-full p-4 pt-2 transition-all duration-300 overflow-auto ${
          sidebarOpen ? 'lg:ml-64' : ''
        }`}
      >
        <div className="flex items-center h-10 mb-4">
          <div className="w-10 lg:hidden"></div>
          
          <h1 className="text-2xl font-semibold text-center flex-1">Aircraft List</h1>
        </div>
        
        <Alert type="error" message={error} />

        <div className="hidden sm:block">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {tableColumns.map(column => (
                      <th key={column.accessor} className="p-2">
                        <input
                          type="text"
                          name={column.accessor}
                          placeholder="Filter"
                          value={filters[column.accessor] || ''}
                          onChange={handleFilterChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-100"
                        />
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-gray-100">
                    {tableColumns.map(column => (
                      <th key={column.accessor} className="p-2 text-xs font-medium uppercase tracking-wider text-gray-700">
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAircrafts.map(aircraft => (
                    <tr 
                      key={aircraft.uav_id} 
                      className={`border-b hover:bg-gray-50 cursor-pointer ${aircraft.is_active === false ? 'bg-red-100' : 'bg-white'}`}
                      onClick={() => handleAircraftClick(aircraft.uav_id)}
                    >
                      {tableColumns.map(column => (
                        <td key={column.accessor} className="p-3">
                          {column.format 
                            ? column.format(aircraft[column.accessor])
                            : (aircraft[column.accessor] || 'N/A')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="sm:hidden">
          {filteredAircrafts.map(aircraft => (
            <div 
              key={aircraft.uav_id}
              className={`rounded-lg shadow mb-4 p-4 ${aircraft.is_active === false ? 'bg-red-100' : 'bg-white'}`}
              onClick={() => handleAircraftClick(aircraft.uav_id)}
            >
              <h3 className="font-bold text-lg mb-2">{aircraft.drone_name || 'Unnamed Aircraft'}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm"><span className="font-medium">Manufacturer:</span> {aircraft.manufacturer || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Type:</span> {aircraft.type || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Motors:</span> {aircraft.motors || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Motor Type:</span> {aircraft.motor_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm"><span className="font-medium">Firmware:</span> {aircraft.firmware_version || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Video:</span> {aircraft.video_system || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">TO/LDG:</span> {aircraft.total_takeoffs || 0}/{aircraft.total_landings || 0}</p>
                  <p className="text-sm"><span className="font-medium">Flight Time:</span> {formatFlightTime(aircraft.total_flight_time)}</p>
                  <p className="text-sm"><span className="font-medium">Serial:</span> {aircraft.serial_number || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 p-4 mt-4">
          <Button 
            onClick={handleNewAircraft} 
            className="max-w-xs"
          >
            New Aircraft
          </Button>
          <Button 
            onClick={handleImportCSV} 
            className="bg-green-500 hover:bg-green-600 max-w-xs"
          >
            Import CSV
          </Button>
          <Button 
            onClick={handleExportCSV} 
            className="bg-blue-500 hover:bg-blue-600 max-w-xs"
          >
            Export CSV
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default AircraftList;