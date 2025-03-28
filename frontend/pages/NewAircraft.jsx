import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert, Sidebar, FormInput } from '../components';

const NewAircraftPage = () => {
  const navigate = useNavigate();
  // Initialize sidebarOpen based on screen size - match Flightlog
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  
  // Add resize handler to match Flightlog behavior
  useEffect(() => {
    const handleResize = () => {
      // For desktop: automatically show sidebar
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } 
      // For mobile: automatically hide sidebar
      else {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // State for form data
  const [formData, setFormData] = useState({
    drone_name: '',
    manufacturer: '',
    type: 'Quad',
    motors: '4',
    motor_type: 'Electric',
    video: 'Analog',
    video_system: 'HD-Zero',
    flight_controller: '',
    firmware: 'Betaflight',
    firmware_version: '',
    esc: '',
    esc_firmware: '',
    receiver: '',
    receiver_firmware: '',
    registration_number: '',
    serial_number: '',
    gps: '1',
    mag: '1',
    baro: '1',
    gyro: '1',
    acc: '1',
    props_maint_date: '',
    motor_maint_date: '',
    frame_maint_date: '',
    props_reminder_date: '',
    motor_reminder_date: '',
    frame_reminder_date: ''
  });

  // State for alerts
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for dropdown options
  const [aircraftTypes] = useState([
    { value: 'Quad', label: 'Quad' },
    { value: 'Tricopter', label: 'Tricopter' },
    { value: 'Hexacopter', label: 'Hexacopter' },
    { value: 'Wing', label: 'Wing' },
    { value: 'Airplane', label: 'Airplane' }
  ]);

  const [flightControllerTypes] = useState([
    { value: 'Happymodel x12 AIO', label: 'Happymodel x12 AIO' },
    { value: 'KISS', label: 'KISS' },
    { value: 'DJI', label: 'DJI' },
    { value: 'Ardupilot', label: 'Ardupilot' },
    { value: 'Other', label: 'Other' }
  ]);

  const [firmwareOptions] = useState([
    { value: 'Betaflight', label: 'Betaflight' },
    { value: 'INAV', label: 'INAV' },
    { value: 'Cleanflight', label: 'Cleanflight' },
    { value: 'Baseflight', label: 'Baseflight' },
    { value: 'Emuflight', label: 'Emuflight' },
    { value: 'Other', label: 'Other' }
  ]);

  const [videoOptions] = useState([
    { value: 'Analog', label: 'Analog' },
    { value: 'Digital', label: 'Digital' },
    { value: 'None', label: 'None' }
  ]);

  const [videoSystemOptions] = useState([
    { value: 'HD-Zero', label: 'HD-Zero' },
    { value: 'DJI O2', label: 'DJI O2' },
    { value: 'DJI O3', label: 'DJI O3' },
    { value: 'DJI O4', label: 'DJI O4' },
    { value: 'Analog', label: 'Analog' },
    { value: 'Walksnail', label: 'Walksnail' },
    { value: 'Caddx Vista', label: 'Caddx Vista' },
    { value: 'Others', label: 'Others' }
  ]);

  // Toggle sidebar function - match Flightlog
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Format date to YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('access_token');
      const user_id = localStorage.getItem('user_id');
      
      if (!token || !user_id) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Required fields validation
      if (!formData.drone_name || !formData.manufacturer || !formData.serial_number) {
        setError('Please fill in all required fields: Drone Name, Manufacturer, and Serial Number');
        return;
      }

      // Create payload for backend
      const aircraftPayload = {
        ...formData,
        user: user_id,
        motors: parseInt(formData.motors),
        // Convert string values to integers if needed
        gps: parseInt(formData.gps),
        mag: parseInt(formData.mag),
        baro: parseInt(formData.baro),
        gyro: parseInt(formData.gyro),
        acc: parseInt(formData.acc)
      };

      const response = await fetch(`${API_URL}/api/uavs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(aircraftPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(typeof errorData === 'object' ? JSON.stringify(errorData) : errorData);
      }

      const data = await response.json();
      setSuccess('Aircraft successfully registered!');
      
      // Reset form after successful submission
      setFormData({
        drone_name: '',
        manufacturer: '',
        type: 'Quad',
        motors: '4',
        motor_type: 'Electric',
        video: 'Analog',
        video_system: 'HD-Zero',
        flight_controller: '',
        firmware: 'Betaflight',
        firmware_version: '',
        esc: '',
        esc_firmware: '',
        receiver: '',
        receiver_firmware: '',
        registration_number: '',
        serial_number: '',
        gps: '1',
        mag: '1',
        baro: '1',
        gyro: '1',
        acc: '1',
        props_maint_date: '',
        motor_maint_date: '',
        frame_maint_date: '',
        props_reminder_date: '',
        motor_reminder_date: '',
        frame_reminder_date: ''
      });
    } catch (err) {
      console.error('Error registering aircraft:', err);
      setError(err.message || 'An error occurred while registering the aircraft.');
    }
  };

  // Helper function to create a select element with custom styling
  const renderSelect = (name, value, options, onChange) => (
    <div className="relative">
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-400 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black pr-8"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen relative">
      {/* Mobile Sidebar Toggle - match Flightlog */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-2 left-2 z-20 bg-gray-800 text-white p-2 rounded-md"
        aria-label="Toggle sidebar for mobile"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {/* Desktop toggle - match Flightlog */}
      <button
        onClick={toggleSidebar}
        className={`hidden lg:block fixed top-2 z-30 bg-gray-800 text-white p-2 rounded-md transition-all duration-300 ${
          sidebarOpen ? 'left-2' : 'left-4'
        }`}
        aria-label="Toggle sidebar for desktop"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content - match layout with Flightlog */}
      <div 
        className={`flex-1 flex flex-col w-full p-4 pt-2 transition-all duration-300 overflow-auto ${
          sidebarOpen ? 'lg:ml-64' : ''
        }`}
      >
        {/* Title with consistent styling */}
        <div className="flex items-center h-10 mb-4">
          {/* Empty div for spacing on mobile (same width as toggle button) */}
          <div className="w-10 lg:hidden"></div>
          
          {/* Centered title */}
          <h1 className="text-2xl font-semibold  text-center flex-1">New Aircraft</h1>
        </div>
        
        {/* Alerts */}
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        
        {/* Form content remains the same */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Drone Name */}
            <div>
              <label className="">Drone Name</label>
              <FormInput
                type="text"
                name="drone_name"
                id="drone_name"
                value={formData.drone_name}
                onChange={handleChange}
                placeholder="ModularHDZero"
                className=""
                required
              />
            </div>
            
            {/* Manufacturer */}
            <div>
              <label className="">Manufacturer</label>
              <FormInput
                type="text"
                name="manufacturer"
                id="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="Happymodel"
                className=""
                required
              />
            </div>
            
            {/* Type */}
            <FormInput
              type="select"
              label="Type"
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              options={aircraftTypes}
              className=""
            />
            
            {/* Motors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="">Motors</label>
                <FormInput
                  type="number"
                  name="motors"
                  id="motors"
                  value={formData.motors}
                  onChange={handleChange}
                  min="0"
                  />
              </div>
              
              {/* Motor Type */}
              <div>
                <label className="">Type of Motor</label>
                <FormInput
                  type="text"
                  name="motor_type"
                  id="motor_type"
                  value={formData.motor_type}
                  onChange={handleChange}
                  placeholder="Electric"
                  />
              </div>
            </div>
            
            {/* Video */}
            <FormInput
              type="select"
              label="Video"
              name="video"
              id="video"
              value={formData.video}
              onChange={handleChange}
              options={videoOptions}
              className=""
            />
            
            {/* Video System */}
            <FormInput
              type="select"
              label="Video System"
              name="video_system"
              id="video_system"
              value={formData.video_system}
              onChange={handleChange}
              options={videoSystemOptions}
              className=""
            />
            
            {/* ESC */}
            <div>
              <label className="">ESC</label>
              <FormInput
                type="text"
                name="esc"
                id="esc"
                value={formData.esc}
                onChange={handleChange}
                placeholder="Happymodel x12 AIO 12A"
              />
            </div>
            
            {/* ESC Firmware */}
            <div>
              <label className="">ESC Firmware</label>
              <FormInput
                type="text"
                name="esc_firmware"
                id="esc_firmware"
                value={formData.esc_firmware}
                onChange={handleChange}
                placeholder="Bluejay_0.21.0"
                />
            </div>
            
            {/* Receiver */}
            <div>
              <label className="">Receiver</label>
              <FormInput
                type="text"
                name="receiver"
                id="receiver"
                value={formData.receiver}
                onChange={handleChange}
                placeholder="RadioMaster RP1"
                />
            </div>
            
            {/* Receiver Firmware */}
            <div>
              <label className="">Receiver Firmware</label>
              <FormInput
                type="text"
                name="receiver_firmware"
                id="receiver_firmware"
                value={formData.receiver_firmware}
                onChange={handleChange}
                placeholder="elrs v3.5.3"
                />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {/* Flight Controller */}
            <div>
              <label className="">Flight Controller</label>
              <FormInput
                type="text"
                name="flight_controller"
                id="flight_controller"
                value={formData.flight_controller}
                onChange={handleChange}
                placeholder="Happymodel x12 AIO"
                />
            </div>
            
            {/* Firmware */}
            <FormInput
              type="select"
              label="Firmware"
              name="firmware"
              id="firmware"
              value={formData.firmware}
              onChange={handleChange}
              options={firmwareOptions}
              className=""
            />
            
            {/* Firmware Version */}
            <div>
              <label className="">Firmware Version</label>
              <FormInput
                type="text"
                name="firmware_version"
                id="firmware_version"
                value={formData.firmware_version}
                onChange={handleChange}
                placeholder="4.5.5"
                />
            </div>
            
            {/* Sensors Grid */}
            <div className="grid grid-cols-5 gap-1">
              <div>
                <label className="">GPS</label>
                <FormInput
                  type="number"
                  name="gps"
                  id="gps"
                  value={formData.gps}
                  onChange={handleChange}
                  min="0"
                  className="text-center "
                />
              </div>
              <div>
                <label className="">Mag</label>
                <FormInput
                  type="number"
                  name="mag"
                  id="mag"
                  value={formData.mag}
                  onChange={handleChange}
                  min="0"
                  className="text-center "
                />
              </div>
              <div>
                <label className="">Baro</label>
                <FormInput
                  type="number"
                  name="baro"
                  id="baro"
                  value={formData.baro}
                  onChange={handleChange}
                  min="0"
                  className="text-center "
                />
              </div>
              <div>
                <label className="">Gyro</label>
                <FormInput
                  type="number"
                  name="gyro"
                  id="gyro"
                  value={formData.gyro}
                  onChange={handleChange}
                  min="0"
                  className="text-center "
                />
              </div>
              <div>
                <label className="">ACC</label>
                <FormInput
                  type="number"
                  name="acc"
                  id="acc"
                  value={formData.acc}
                  onChange={handleChange}
                  min="0"
                  className="text-center "
                />
              </div>
            </div>
            
            {/* Registration Number */}
            <div>
              <label className="">Registration Number</label>
              <FormInput
                type="text"
                name="registration_number"
                id="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                placeholder="CHEdkI9245ddjG325"
                />
            </div>
            
            {/* Serial Number */}
            <div>
              <label className="">Serial Number</label>
              <FormInput
                type="text"
                name="serial_number"
                id="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="SN5678905312AB"
                required
              />
            </div>
            
            {/* Maintenance Dates */}
            <h3 className="text-lg font-medium pt-2 text-black">Last Maintenance:</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Props Maintenance */}
              <div>
                <label className="">Props Maint:</label>
                <FormInput
                  type="date"
                  name="props_maint_date"
                  id="props_maint_date"
                  value={formatDateForInput(formData.props_maint_date)}
                  onChange={handleChange}
                  />
              </div>
              <div>
                <label className="">Next:</label>
                <FormInput
                  type="date"
                  name="props_reminder_date"
                  id="props_reminder_date"
                  value={formatDateForInput(formData.props_reminder_date)}
                  onChange={handleChange}
                  className="mt-0 w-full "
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Motor Maintenance */}
              <div>
                <label className="">Motor Maint:</label>
                <FormInput
                  type="date"
                  name="motor_maint_date"
                  id="motor_maint_date"
                  value={formatDateForInput(formData.motor_maint_date)}
                  onChange={handleChange}
                  />
              </div>
              <div>
                <label className="">Next:</label>
                <FormInput
                  type="date"
                  name="motor_reminder_date"
                  id="motor_reminder_date"
                  value={formatDateForInput(formData.motor_reminder_date)}
                  onChange={handleChange}
                  className="mt-0 w-full "
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Frame Maintenance */}
              <div>
                <label className="">Frame Maint:</label>
                <FormInput
                  type="date"
                  name="frame_maint_date"
                  id="frame_maint_date"
                  value={formatDateForInput(formData.frame_maint_date)}
                  onChange={handleChange}
                  />
              </div>
              <div>
                <label className="">Next:</label>
                <FormInput
                  type="date"
                  name="frame_reminder_date"
                  id="frame_reminder_date"
                  value={formatDateForInput(formData.frame_reminder_date)}
                  onChange={handleChange}
                  className="mt-0 w-full "
                />
              </div>
            </div>
          </div>
          
          {/* Submit Button - Full Width */}
          <div className="col-span-1 md:col-span-2 mt-6 flex justify-center">
            <Button type="submit" className="max-w-md">
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAircraftPage;