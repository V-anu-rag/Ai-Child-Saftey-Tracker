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
        if (typeof map !== 'undefined' && typeof map.flyTo === 'function') {
            map.flyTo({ center: [${lng}, ${lat}], zoom: ${zoom}, duration: 1500 });
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
        <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.3.0/dist/maplibre-gl.css" />
        <script src="https://unpkg.com/maplibre-gl@4.3.0/dist/maplibre-gl.js"></script>
        <style>
            html, body, #map { height: 100%; margin: 0; padding: 0; }
            .custom-div-icon { background: none; border: none; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Helper to generate GeoJSON circle
            function getGeoJSONCircle(center, radiusInMeters, points) {
                if (!points) points = 64;
                var lng = center[0];
                var lat = center[1];
                var km = radiusInMeters / 1000;
                var coords = [];
                var distanceX = km / (111.32 * Math.cos((lat * Math.PI) / 180));
                var distanceY = km / 110.574;

                for (var i = 0; i < points; i++) {
                    var theta = (i / points) * (2 * Math.PI);
                    var x = distanceX * Math.cos(theta);
                    var y = distanceY * Math.sin(theta);
                    coords.push([lng + x, lat + y]);
                }
                coords.push(coords[0]);

                return {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [coords]
                    }
                };
            }

            window.onload = function() {
                console.log("MapCN initializing at:", ${defaultLat}, ${defaultLng});
                var map = new maplibregl.Map({
                    container: 'map',
                    style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
                    center: [${defaultLng}, ${defaultLat}], // Lng, Lat!
                    zoom: 15,
                    attributionControl: false,
                    interactive: ${scrollEnabled}
                });

                var markers = {};
                var selectedMarker = null;

                function updateMap(data) {
                    if (!map) return;
                    console.log("Updating MapCN data", data);
                    
                    // Update children markers
                    if (data.childrenLocations) {
                        // Remove markers not in the new data
                        Object.keys(markers).forEach(function(id) {
                            if (!data.childrenLocations.find(function(c) { return c.id === id; })) {
                                markers[id].remove();
                                delete markers[id];
                            }
                        });

                        data.childrenLocations.forEach(function(child) {
                            var pos = [child.longitude, child.latitude]; // Lng, Lat!
                            if (!markers[child.id]) {
                                var el = document.createElement('div');
                                el.className = 'custom-div-icon';
                                el.innerHTML = '<div style="background-color: #D64550; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(214, 69, 80, 0.4); position: relative;">' +
                                               '<div style="position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: white; color: #1C2826; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #eee;">' +
                                               (child.name || "Child") +
                                               '</div>' +
                                               '</div>';

                                markers[child.id] = new maplibregl.Marker({ element: el })
                                    .setLngLat(pos)
                                    .addTo(map);

                                el.addEventListener('click', function() {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: child.id }));
                                });
                            } else {
                                markers[child.id].setLngLat(pos);
                            }
                        });
                    }

                    // Update geofences
                    if (data.geofences) {
                        var applyGeofences = function() {
                            if (map.getLayer("geofences-fill")) map.removeLayer("geofences-fill");
                            if (map.getLayer("geofences-stroke")) map.removeLayer("geofences-stroke");
                            if (map.getSource("geofences-src")) map.removeSource("geofences-src");

                            var features = data.geofences.map(function(zone) {
                                return getGeoJSONCircle([zone.longitude, zone.latitude], zone.radius);
                            });

                            map.addSource("geofences-src", {
                                type: "geojson",
                                data: {
                                    type: "FeatureCollection",
                                    features: features
                                }
                            });

                            map.addLayer({
                                id: "geofences-fill",
                                type: "fill",
                                source: "geofences-src",
                                paint: {
                                    "fill-color": "#3B82F6",
                                    "fill-opacity": 0.15
                                }
                            });

                            map.addLayer({
                                id: "geofences-stroke",
                                type: "line",
                                source: "geofences-src",
                                paint: {
                                    "line-color": "#3B82F6",
                                    "line-width": 2,
                                    "line-dasharray": [2, 2]
                                }
                            });
                        };

                        if (map.isStyleLoaded()) {
                            applyGeofences();
                        } else {
                            map.once("style.load", applyGeofences);
                        }
                    }

                    // Update selected location
                    if (data.selectedLocation) {
                        var pos = [data.selectedLocation.lng, data.selectedLocation.lat];
                        if (!selectedMarker) {
                            var el = document.createElement('div');
                            el.innerHTML = '<div style="background-color: #3B82F6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>';
                            selectedMarker = new maplibregl.Marker({ element: el })
                                .setLngLat(pos)
                                .addTo(map);
                        } else {
                            selectedMarker.setLngLat(pos);
                        }
                    } else if (selectedMarker) {
                        selectedMarker.remove();
                        selectedMarker = null;
                    }
                }

                map.on('click', function(e) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapPress',
                        lat: e.lngLat.lat,
                        lng: e.lngLat.lng
                    }));
                });

                // Signal ready
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
                
                // Expose updateMap to window for injectJavaScript
                window.updateMap = updateMap;
                
                // Expose map to window for flyTo
                window.map = map;
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
