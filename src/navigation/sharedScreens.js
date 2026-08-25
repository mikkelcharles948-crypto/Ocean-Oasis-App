import React from 'react';

import ActivityDetailScreen from '../screens/activities/ActivityDetailScreen';
import BookActivityScreen from '../screens/activities/BookActivityScreen';
import ActivitiesScreen from '../screens/activities/ActivitiesScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import EventsScreen from '../screens/events/EventsScreen';
import DestinationDetailScreen from '../screens/explore/DestinationDetailScreen';
import DiningScreen from '../screens/dining/DiningScreen';
import DiningVenueScreen from '../screens/dining/DiningVenueScreen';
import MenuScreen from '../screens/dining/MenuScreen';
import ConciergeScreen from '../screens/concierge/ConciergeScreen';
import ItineraryScreen from '../screens/itinerary/ItineraryScreen';
import PromotionsScreen from '../screens/promotions/PromotionsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import FeedbackScreen from '../screens/feedback/FeedbackScreen';
import ContactReceptionScreen from '../screens/contact/ContactReceptionScreen';
import NewRequestScreen from '../screens/requests/NewRequestScreen';
import RequestDetailScreen from '../screens/requests/RequestDetailScreen';
import DigitalCheckInScreen from '../screens/mystay/DigitalCheckInScreen';
import NewReservationScreen from '../screens/mystay/NewReservationScreen';
import BookRoomScreen from '../screens/mystay/BookRoomScreen';
import MapScreen from '../screens/explore/MapScreen';
import PastStaysScreen from '../screens/profile/PastStaysScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import PrivacySettingsScreen from '../screens/profile/PrivacySettingsScreen';
import AccessibilityScreen from '../screens/profile/AccessibilityScreen';
import LanguageScreen from '../screens/profile/LanguageScreen';
import RoomPreferencesScreen from '../screens/mystay/RoomPreferencesScreen';
import FolioScreen from '../screens/billing/FolioScreen';
import HotelAmenitiesScreen from '../screens/hotel/HotelAmenitiesScreen';
import LocalGuideScreen from '../screens/explore/LocalGuideScreen';
import TrailMapsScreen from '../screens/explore/TrailMapsScreen';
import LoyaltyScreen from '../screens/profile/LoyaltyScreen';

// Registers the full set of cross-tab detail/utility screens onto a given
// Stack.Navigator so navigation.navigate('ActivityDetail', {...}) works
// consistently no matter which bottom tab the user started from.
export function addSharedScreens(Stack) {
  return (
    <>
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <Stack.Screen name="BookActivity" component={BookActivityScreen} />
      <Stack.Screen name="Activities" component={ActivitiesScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} />
      <Stack.Screen name="Dining" component={DiningScreen} />
      <Stack.Screen name="DiningVenue" component={DiningVenueScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Concierge" component={ConciergeScreen} />
      <Stack.Screen name="Itinerary" component={ItineraryScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="ContactReception" component={ContactReceptionScreen} />
      <Stack.Screen name="NewRequest" component={NewRequestScreen} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
      <Stack.Screen name="DigitalCheckIn" component={DigitalCheckInScreen} />
      <Stack.Screen name="NewReservation" component={NewReservationScreen} />
      <Stack.Screen name="BookRoom" component={BookRoomScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen name="PastStays" component={PastStaysScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="RoomPreferences" component={RoomPreferencesScreen} />
      <Stack.Screen name="Folio" component={FolioScreen} />
      <Stack.Screen name="HotelAmenities" component={HotelAmenitiesScreen} />
      <Stack.Screen name="LocalGuide" component={LocalGuideScreen} />
      <Stack.Screen name="TrailMaps" component={TrailMapsScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
    </>
  );
}
