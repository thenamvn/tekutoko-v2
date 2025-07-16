import React, { useState, useEffect } from 'react';

const LocationModal = ({
  isOpen,
  onClose,
  onSave,
  roomId,
  username,
  apiUrl
}) => {
  const [locationMethod, setLocationMethod] = useState('auto');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Debug: Log khi component re-render - THÊM DEPENDENCY ARRAY
  useEffect(() => {
    // console.log('LocationModal rendered:', { isOpen, currentLocation, isSaving });
  }, [isOpen, currentLocation, isSaving]); // Thêm dependency array này

  // Reset state khi modal đóng/mở
  useEffect(() => {
    if (!isOpen) {
      setCurrentLocation(null);
      setManualLocation('');
      setLocationError('');
      setLocationMethod('auto');
      setIsGettingLocation(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  // ...existing code... (giữ nguyên tất cả các hàm khác)

  // Hàm lấy vị trí GPS tự động
  const getCurrentLocation = () => {
    console.log('getCurrentLocation called');
    setIsGettingLocation(true);
    setLocationError('');
    setCurrentLocation(null);

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị GPS');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'TekutokoApp/1.0'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to get address');
          }

          const data = await response.json();

          // ✅ EXTRACT CITY VÀ COUNTRY NGAY TẠI ĐÂY
          let city = '';
          let country = '';

          if (data.address) {
            const addr = data.address;
            city = addr.city || addr.city_district || addr.town || addr.village || '';
            country = addr.country_code ? addr.country_code.toUpperCase() : '';
          }

          const location = {
            lat: latitude,
            lng: longitude,
            address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            city: city,        // ✅ EXTRACT RIÊNG
            country: country,  // ✅ EXTRACT RIÊNG
            nominatim_data: data // ✅ GIỮ LẠI CHO HIỂN THỊ
          };

          console.log('Location found:', location);
          setCurrentLocation(location);
          setLocationError('');
        } catch (error) {
          console.error('Error getting address:', error);
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            city: '',
            country: '',
            nominatim_data: null
          });
          setLocationError('');
        }

        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Không thể lấy vị trí';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Người dùng từ chối quyền truy cập vị trí';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng';
            break;
          case error.TIMEOUT:
            errorMessage = 'Hết thời gian chờ lấy vị trí';
            break;
          default:
            errorMessage = 'Lỗi không xác định khi lấy vị trí';
            break;
        }
        console.log('Geolocation error:', errorMessage);
        setLocationError(errorMessage);
        setIsGettingLocation(false);
        setCurrentLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Hàm tìm kiếm địa chỉ thủ công với Nominatim
  const searchManualLocation = async () => {
    if (!manualLocation.trim()) {
      setLocationError('Vui lòng nhập địa chỉ');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');
    setCurrentLocation(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualLocation)}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TekutokoApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search location');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];

        // ✅ EXTRACT CITY VÀ COUNTRY NGAY TẠI ĐÂY
        let city = '';
        let country = '';

        if (result.address) {
          const addr = result.address;
          city = addr.city || addr.city_district || addr.town || addr.village || '';
          country = addr.country_code ? addr.country_code.toUpperCase() : '';
        }

        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name,
          city: city,        // ✅ EXTRACT RIÊNG  
          country: country,  // ✅ EXTRACT RIÊNG
          nominatim_data: result // ✅ GIỮ LẠI CHO HIỂN THỊ
        };

        // console.log('Manual location found:', location);
        setCurrentLocation(location);
        setLocationError('');
      } else {
        setLocationError('Không tìm thấy địa chỉ này');
        setCurrentLocation(null);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setLocationError('Lỗi khi tìm kiếm địa chỉ');
      setCurrentLocation(null);
    }

    setIsGettingLocation(false);
  };

  // ✅ SỬA HÀM SAVE LOCATION
  const saveLocation = async () => {
    if (!currentLocation) {
      setLocationError('Vui lòng chọn vị trí trước khi lưu');
      return;
    }

    if (!roomId || !username || !apiUrl) {
      setLocationError('Thiếu thông tin cần thiết để lưu vị trí');
      return;
    }

    setIsSaving(true);
    setLocationError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLocationError('Vui lòng đăng nhập lại');
        setIsSaving(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/room/${roomId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: currentLocation.address,
          admin_username: username,
          city: currentLocation.city,       // ✅ GỬI CITY
          country: currentLocation.country  // ✅ GỬI COUNTRY  
        })
      });

      // console.log('Save response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        alert('Đã lưu vị trí thành công!');
        console.log('Saved location data:', responseData.data);
        if (onSave) {
          onSave(responseData.data);
        }
        handleClose();
      } else {
        const errorData = await response.text();
        console.error('Save location error:', errorData);
        setLocationError('Lỗi khi lưu vị trí');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      setLocationError('Lỗi kết nối khi lưu vị trí');
    } finally {
      setIsSaving(false);
    }
  };

  // Hàm đóng modal và reset state
  const handleClose = () => {
    // console.log('handleClose called');
    setCurrentLocation(null);
    setManualLocation('');
    setLocationError('');
    setLocationMethod('auto');
    setIsGettingLocation(false);
    setIsSaving(false);
    onClose();
  };

  // Hàm reset khi đổi method
  const handleMethodChange = (method) => {
    // console.log('Method changed to:', method);
    setLocationMethod(method);
    setCurrentLocation(null);
    setLocationError('');
    setManualLocation('');
  };

  // Hàm xử lý click button save với log
  const handleSaveClick = (e) => {
    // console.log('🔥 Save button clicked!', e);
    e.preventDefault();
    e.stopPropagation();
    saveLocation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Đặt vị trí phòng</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Chọn cách lấy vị trí:</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleMethodChange('auto')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${locationMethod === 'auto'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                GPS tự động
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange('manual')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${locationMethod === 'manual'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Nhập thủ công
              </button>
            </div>
          </div>

          {/* Auto GPS Method */}
          {locationMethod === 'auto' && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Nhấn nút bên dưới để lấy vị trí hiện tại của bạn
              </div>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isGettingLocation ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lấy vị trí...
                  </>
                ) : (
                  'Lấy vị trí hiện tại'
                )}
              </button>
            </div>
          )}

          {/* Manual Input Method */}
          {locationMethod === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập địa chỉ:
                </label>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Ví dụ: Học viện Báo chí và Tuyên truyền"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchManualLocation();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={searchManualLocation}
                disabled={isGettingLocation || !manualLocation.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isGettingLocation ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tìm kiếm...
                  </>
                ) : (
                  'Tìm kiếm địa chỉ'
                )}
              </button>
            </div>
          )}

          {/* Error Display */}
          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-600">{locationError}</span>
              </div>
            </div>
          )}

          {/* Location Preview */}
          {currentLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800">Vị trí đã tìm thấy:</p>
                  <p className="text-sm text-blue-600 mt-1 break-words">{currentLocation.address}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    Tọa độ: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-orange-600 mt-2 font-medium">
                    📍 Vui lòng kiểm tra vị trí trước khi lưu
                  </p>
                </div>
              </div>

              {/* OpenStreetMap Preview */}
              <div className="mt-3 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 0.01},${currentLocation.lat - 0.01},${currentLocation.lng + 0.01},${currentLocation.lat + 0.01}&layer=mapnik&marker=${currentLocation.lat},${currentLocation.lng}`}
                  allowFullScreen
                  title="Location Preview"
                ></iframe>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${currentLocation.lat}&mlon=${currentLocation.lng}#map=15/${currentLocation.lat}/${currentLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Xem chi tiết trên OpenStreetMap
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            {!currentLocation ? (
              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu vị trí'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;