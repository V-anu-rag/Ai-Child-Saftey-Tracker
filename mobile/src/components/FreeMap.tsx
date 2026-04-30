import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface FreeMapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

interface FreeMapProps {
  initialRegion?: { latitude: number; longitude: number };
  childrenLocations?: { id: string; latitude: number; longitude: number; name?: string; batteryLevel?: number; timestamp?: string }[];
  geofences?: { id: string; latitude: number; longitude: number; radius: number; color: string; name?: string }[];
  selectedLocation?: { lat: number; lng: number } | null;
  onMapPress?: (coords: { lat: number; lng: number }) => void;
  onMarkerPress?: (childId: string) => void;
  scrollEnabled?: boolean;
}

const FreeMap = forwardRef<FreeMapRef, FreeMapProps>(({
  initialRegion,
  childrenLocations = [],
  geofences = [],
  selectedLocation,
  onMapPress,
  onMarkerPress,
  scrollEnabled = true
}, ref) => {
  const webViewRef = useRef<WebView>(null);

  const defaultLat = initialRegion?.latitude ?? 28.6139;
  const defaultLng = initialRegion?.longitude ?? 77.2090;

  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number, zoom: number = 15) => {
      webViewRef.current?.injectJavaScript(`
        if (typeof map !== 'undefined') {
            map.flyTo([${lat}, ${lng}], ${zoom});
        }
        true;
      `);
    }
  }));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            html, body, #map { height: 100%; margin: 0; padding: 0; }
            .custom-div-icon { background: none; border: none; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            window.onload = function() {
                console.log("Map initializing at:", ${defaultLat}, ${defaultLng});
                var map = L.map('map', { 
                    zoomControl: false,
                    dragging: ${scrollEnabled},
                    touchZoom: ${scrollEnabled},
                    doubleClickZoom: ${scrollEnabled},
                    scrollWheelZoom: ${scrollEnabled}
                }).setView([${defaultLat}, ${defaultLng}], 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                var markers = {};
                var circles = {};
                var selectedMarker = null;

                function updateMap(data) {
                    if (!map) return;
                    console.log("Updating map data", data);
                    
                    // Update children markers
                    if (data.childrenLocations) {
                        data.childrenLocations.forEach(child => {
                            if (!markers[child.id]) {
                                var customIcon = L.divIcon({
                                    className: 'custom-div-icon',
                                    html: '<div style="background-color: #D64550; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(214, 69, 80, 0.4); position: relative;">' +
                                          '<div style="position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: white; color: #1C2826; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #eee;">' +
                                          (child.name || "Child") +
                                          '</div>' +
                                          '</div>',
                                    iconSize: [14, 14],
                                    iconAnchor: [7, 7]
                                });
                                markers[child.id] = L.marker([child.latitude, child.longitude], { icon: customIcon }).addTo(map);
                                markers[child.id].on('click', function() {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: child.id }));
                                });
                            } else {
                                markers[child.id].setLatLng([child.latitude, child.longitude]);
                            }
                        });
                    }

                    // Update geofences
                    if (data.geofences) {
                        data.geofences.forEach(zone => {
                            if (!circles[zone.id]) {
                                circles[zone.id] = L.circle([zone.latitude, zone.longitude], {
                                    color: zone.color,
                                    fillColor: zone.color,
                                    fillOpacity: 0.2,
                                    radius: zone.radius
                                }).addTo(map);
                            } else {
                                circles[zone.id].setLatLng([zone.latitude, zone.longitude]);
                                circles[zone.id].setRadius(zone.radius);
                            }
                        });
                    }

                    // Update selected location
                    if (data.selectedLocation) {
                        if (!selectedMarker) {
                            selectedMarker = L.marker([data.selectedLocation.lat, data.selectedLocation.lng]).addTo(map);
                        } else {
                            selectedMarker.setLatLng([data.selectedLocation.lat, data.selectedLocation.lng]);
                        }
                    } else if (selectedMarker) {
                        map.removeLayer(selectedMarker);
                        selectedMarker = null;
                    }
                }

                map.on('click', function(e) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapPress',
                        lat: e.latlng.lat,
                        lng: e.latlng.lng
                    }));
                });

                // Initial data sync
                updateMap({
                    childrenLocations: ${JSON.stringify(childrenLocations)},
                    geofences: ${JSON.stringify(geofences)},
                    selectedLocation: ${JSON.stringify(selectedLocation)}
                });

                // Signal ready
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
                
                // Expose updateMap to window for injectJavaScript
                window.updateMap = updateMap;
            };
        </script>
    </body>
    </html>
  `;

  useEffect(() => {
    if (webViewRef.current) {
      const payload = {
        childrenLocations,
        geofences,
        selectedLocation
      };
      webViewRef.current.injectJavaScript(`
        if (typeof updateMap === 'function') {
            updateMap(${JSON.stringify(payload)});
        }
        true;
      `);
    }
  }, [childrenLocations, geofences, selectedLocation]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') {
        // Send initial data once ready
        const payload = { childrenLocations, geofences, selectedLocation };
        webViewRef.current?.injectJavaScript(`if (typeof updateMap === 'function') { updateMap(${JSON.stringify(payload)}); } true;`);
      } else if (data.type === 'mapPress' && onMapPress) {
        onMapPress({ lat: data.lat, lng: data.lng });
      } else if (data.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(data.id);
      }
    } catch (err) {}
  };

  return (
    <View style={styles.container}>
      <WebView
        key={`${defaultLat}-${defaultLng}`}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        mixedContentMode="always"
      />
    </View>
  );
});

FreeMap.displayName = 'FreeMap';

export default FreeMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb'
  },
});
