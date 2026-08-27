import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Pill } from '../../components/UI';
import { colors, spacing, radius } from '../../theme/theme';
import { DESTINATIONS, DESTINATION_CATEGORIES } from '../../data/mockData';
import { HOTEL_LOCATION, DESTINATION_COORDS } from '../../data/geoData';
import { getLocalizedContent } from '../../i18n/content';
import destinationsContent from '../../i18n/content/destinations';

// Real OpenStreetMap tiles rendered via Leaflet inside a WebView — no native
// map module (react-native-maps/expo-maps) and no Google Maps API key, so
// this keeps working in plain Expo Go, unlike a native MapView which needs
// a custom dev client. The plain tile.openstreetmap.org server is fine for
// this kind of light, occasional use; a production release doing this at
// real scale should move to a paid tile host (MapTiler, Stadia, etc.) per
// OSM's usage policy.
function buildMapHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #DCEEEA; }
    .pin-hotel { background: #0B3B45; border: 2px solid #fff; border-radius: 50%; width: 26px; height: 26px; }
    .pin-dest { background: #1F8A8C; border: 2px solid #fff; border-radius: 50%; width: 18px; height: 18px; }
    .pin-me { background: #2E7DE1; border: 3px solid #fff; border-radius: 50%; width: 18px; height: 18px; box-shadow: 0 0 0 6px rgba(46,125,225,0.25); }
    .leaflet-popup-content { font-family: -apple-system, Roboto, sans-serif; font-size: 13px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${HOTEL_LOCATION.lat}, ${HOTEL_LOCATION.lng}], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var hotelIcon = L.divIcon({ className: 'pin-hotel', iconSize: [26, 26] });
    var destIcon = L.divIcon({ className: 'pin-dest', iconSize: [18, 18] });
    var meIcon = L.divIcon({ className: 'pin-me', iconSize: [18, 18] });

    L.marker([${HOTEL_LOCATION.lat}, ${HOTEL_LOCATION.lng}], { icon: hotelIcon })
      .addTo(map)
      .bindPopup(${JSON.stringify(HOTEL_LOCATION.label)});

    var markers = {};
    var pins = ${JSON.stringify(
      DESTINATIONS.filter((d) => DESTINATION_COORDS[d.id]).map((d) => ({
        id: d.id,
        category: d.category,
        label: d.title,
        lat: DESTINATION_COORDS[d.id].lat,
        lng: DESTINATION_COORDS[d.id].lng,
      }))
    )};
    pins.forEach(function (p) {
      var m = L.marker([p.lat, p.lng], { icon: destIcon }).addTo(map).bindPopup(p.label);
      markers[p.id] = { marker: m, category: p.category };
    });

    var meMarker = null;
    function setMyLocation(lat, lng) {
      if (meMarker) {
        meMarker.setLatLng([lat, lng]);
      } else {
        meMarker = L.marker([lat, lng], { icon: meIcon, zIndexOffset: 1000 }).addTo(map);
      }
    }
    function focusOn(lat, lng, zoom) {
      map.setView([lat, lng], zoom || map.getZoom());
    }
    function applyFilter(category) {
      Object.keys(markers).forEach(function (id) {
        var entry = markers[id];
        var show = category === 'All' || entry.category === category;
        if (show && !map.hasLayer(entry.marker)) map.addLayer(entry.marker);
        if (!show && map.hasLayer(entry.marker)) map.removeLayer(entry.marker);
      });
    }

    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);
    function handleMessage(event) {
      try {
        var msg = JSON.parse(event.data);
        if (msg.type === 'location') setMyLocation(msg.lat, msg.lng);
        if (msg.type === 'focus') focusOn(msg.lat, msg.lng, msg.zoom);
        if (msg.type === 'filter') applyFilter(msg.category);
      } catch (e) {}
    }
  </script>
</body>
</html>`;
}

const MAP_HTML = buildMapHtml();

export default function MapScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState('All');
  const [permissionState, setPermissionState] = useState('checking'); // checking | granted | denied
  const webviewRef = useRef(null);
  const lastKnownLocation = useRef(null);

  const destinationTitleById = useMemo(() => {
    const map = {};
    DESTINATIONS.forEach((d) => {
      const localized = getLocalizedContent(destinationsContent, d.id, i18n.language, d);
      map[d.id] = localized.title || d.title;
    });
    return map;
  }, [i18n.language]);

  const postToMap = useCallback((message) => {
    webviewRef.current?.postMessage(JSON.stringify(message));
  }, []);

  useEffect(() => {
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionState('denied');
        return;
      }
      setPermissionState('granted');
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 15 },
        (position) => {
          const { latitude, longitude } = position.coords;
          lastKnownLocation.current = { lat: latitude, lng: longitude };
          postToMap({ type: 'location', lat: latitude, lng: longitude });
        }
      );
    })();
    return () => subscription?.remove();
  }, [postToMap]);

  const handleCategoryChange = (c) => {
    setCategory(c);
    postToMap({ type: 'filter', category: c });
  };

  const recenterOnHotel = () => postToMap({ type: 'focus', lat: HOTEL_LOCATION.lat, lng: HOTEL_LOCATION.lng, zoom: 11 });

  const recenterOnMe = () => {
    if (!lastKnownLocation.current) return;
    postToMap({ type: 'focus', lat: lastKnownLocation.current.lat, lng: lastKnownLocation.current.lng, zoom: 14 });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('explore.map')} onBack={() => navigation.goBack()} />
      {/* A plain wrapping row, not a horizontal ScrollView — see
          ExploreScreen.js's renderItem comment for why. */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
        <Pill label={t('explore.all')} selected={category === 'All'} onPress={() => handleCategoryChange('All')} />
        {DESTINATION_CATEGORIES.map((c) => (
          <Pill key={c} label={t(`common.category.${c}`)} selected={category === c} onPress={() => handleCategoryChange(c)} />
        ))}
      </View>

      <View style={styles.mapArea}>
        <WebView
          ref={webviewRef}
          source={{ html: MAP_HTML }}
          style={{ flex: 1, backgroundColor: '#DCEEEA' }}
          onMessage={() => {}}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled
        />
        <View style={styles.mapButtons}>
          <TouchableOpacity style={styles.mapButton} onPress={recenterOnHotel} accessibilityRole="button" accessibilityLabel={t('explore.recenterHotel')}>
            <Ionicons name="home" size={18} color={colors.deepOcean} />
          </TouchableOpacity>
          {permissionState === 'granted' && (
            <TouchableOpacity style={styles.mapButton} onPress={recenterOnMe} accessibilityRole="button" accessibilityLabel={t('explore.myLocation')}>
              <Ionicons name="locate" size={18} color={colors.deepOcean} />
            </TouchableOpacity>
          )}
        </View>
        {permissionState === 'denied' && (
          <View style={styles.noticeBanner}>
            <Ionicons name="location-outline" size={14} color={colors.slate} />
            <Text style={styles.noticeText}>{t('explore.locationDenied')}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapArea: { flex: 1, margin: spacing.lg, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#DCEEEA' },
  mapButtons: { position: 'absolute', right: spacing.sm, top: spacing.sm, gap: spacing.sm },
  mapButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 3 } }),
  },
  noticeBanner: {
    position: 'absolute', bottom: 10, left: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md,
  },
  noticeText: { fontSize: 11.5, color: colors.slate, flex: 1 },
});
