import React, { useState, useEffect } from 'react';

const ViewLocationModal = ({ isOpen, onClose, roomInfo }) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [address, setAddress] = useState('');
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Load Leaflet CSS and JS
    useEffect(() => {
        if (!window.L && isOpen) {
            // Load Leaflet CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            cssLink.crossOrigin = '';
            document.head.appendChild(cssLink);

            // Load Leaflet JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => setMapLoaded(true);
            document.head.appendChild(script);
        } else if (window.L) {
            setMapLoaded(true);
        }
    }, [isOpen]);

    // Initialize map when component mounts
    useEffect(() => {
        if (mapLoaded && isOpen && roomInfo?.location) {
            initializeMap();
            fetchAddress(); // Fetch address from coordinates
        }
    }, [mapLoaded, isOpen, roomInfo]);

    const getCoordinates = (location) => {
        if (!location) return null;

        // Xử lý format {x: lng, y: lat}
        const lat = parseFloat(location.y); // y là latitude
        const lng = parseFloat(location.x); // x là longitude

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
            console.error('Invalid coordinates:', { lat, lng });
            return null;
        }

        // Validate coordinate ranges
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.error('Coordinates out of valid range:', { lat, lng });
            return null;
        }

        return { lat, lng };
    };

    // Fetch address from coordinates using Nominatim
    const fetchAddress = async () => {
        const coordinates = getCoordinates(roomInfo?.location);
        if (!coordinates) return;

        setLoadingAddress(true);
        try {
            const { lat, lng } = coordinates;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=vi`
            );

            if (response.ok) {
                const data = await response.json();
                // Build formatted address
                const addressParts = [];
                if (data.address) {
                    const addr = data.address;

                    // Add house number and road
                    if (addr.house_number) addressParts.push(addr.house_number);
                    if (addr.road) addressParts.push(addr.road);

                    // Add quarter/suburb
                    if (addr.quarter) addressParts.push(addr.quarter);
                    else if (addr.suburb) addressParts.push(addr.suburb);

                    // Add district
                    if (addr.city_district) addressParts.push(addr.city_district);
                    else if (addr.district) addressParts.push(addr.district);

                    // Add city
                    if (addr.city) addressParts.push(addr.city);
                    else if (addr.town) addressParts.push(addr.town);

                    // Add state/province
                    if (addr.state) addressParts.push(addr.state);

                    // Add country
                    if (addr.country) addressParts.push(addr.country);
                }

                const formattedAddress = addressParts.length > 0
                    ? addressParts.join(', ')
                    : data.display_name || 'Không thể xác định địa chỉ';

                setAddress(formattedAddress);
            } else {
                setAddress('Không thể lấy địa chỉ');
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            setAddress('Lỗi khi lấy địa chỉ');
        } finally {
            setLoadingAddress(false);
        }
    };

    const initializeMap = () => {
        const mapElement = document.getElementById('view-location-map');
        if (!mapElement || !window.L) return;

        // Clear existing map
        mapElement.innerHTML = '';

        const coordinates = getCoordinates(roomInfo.location);
        if (!coordinates) return;

        const { lat, lng } = coordinates;

        // Create map
        const map = window.L.map('view-location-map').setView([lat, lng], 15);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Custom icon for room marker
        const roomIcon = window.L.divIcon({
            html: `
        <div style="
          background: linear-gradient(135deg, #8B5CF6, #6366F1);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        ">📍</div>
      `,
            className: 'custom-room-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Add marker for room location
        const marker = window.L.marker([lat, lng], { icon: roomIcon }).addTo(map);

        // Add popup to marker
        marker.bindPopup(`
      <div style="text-align: center; padding: 5px;">
        <h3 style="margin: 0 0 5px 0; font-weight: bold; color: #374151;">${roomInfo.room_title || roomInfo.title}</h3>
        <p style="margin: 0; font-size: 12px; color: #6B7280;">Vị trí phòng game</p>
      </div>
    `).openPopup();

        // Add scale control
        window.L.control.scale().addTo(map);
    };

    if (!isOpen) return null;

    // Get coordinates for display
    const coordinates = getCoordinates(roomInfo?.location);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto scrollbar-hide">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-violet-600 to-indigo-600">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                            📍 Vị trí phòng: {roomInfo?.room_title || roomInfo?.title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {coordinates ? (
                        <div>
                            {/* Map Container */}
                            <div className="h-80 bg-gray-200 rounded-lg mb-4 overflow-hidden relative border">
                                {mapLoaded ? (
                                    <div id="view-location-map" className="w-full h-full"></div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-2"></div>
                                            <p className="text-gray-500">Đang tải bản đồ...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Location Info */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-start space-x-2">
                                    <span className="text-gray-500 font-medium min-w-[80px]">Địa chỉ:</span>
                                    <div className="text-gray-700">
                                        {loadingAddress ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"></div>
                                                <span className="text-sm">Đang tìm địa chỉ...</span>
                                            </div>
                                        ) : (
                                            address || 'Không thể xác định địa chỉ'
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium min-w-[80px]">Tọa độ:</span>
                                    <span className="text-gray-700 font-mono text-sm">
                                        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                                    </span>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex space-x-2 pt-2">
                                    <button
                                        onClick={() => {
                                            const { lat, lng } = coordinates;
                                            // Mở Google Maps app trên điện thoại
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                                        }}
                                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                                    >
                                        <span>🧭</span>
                                        <span>Chỉ đường</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const { lat, lng } = coordinates;
                                            navigator.clipboard.writeText(`${lat}, ${lng}`);
                                            alert('Đã copy tọa độ vào clipboard!');
                                        }}
                                        className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                                    >
                                        <span>📋</span>
                                        <span>Copy tọa độ</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📍</div>
                            <p className="text-gray-500 text-lg mb-2">Phòng chưa có vị trí được thiết lập</p>
                            <p className="text-gray-400 text-sm">Chỉ người quản lý mới có thể thiết lập vị trí cho phòng</p>
                            {roomInfo?.location && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-red-600 text-sm">Debug: Invalid coordinate format</p>
                                    <pre className="text-xs text-red-500 mt-1">
                                        {JSON.stringify(roomInfo.location, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewLocationModal;