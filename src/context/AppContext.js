import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as ExpoLinking from 'expo-linking';
import Constants from 'expo-constants';
import {
  GUEST, RESERVATION, ROOM, INITIAL_SERVICE_REQUESTS, INITIAL_NOTIFICATIONS,
  ACTIVITIES, EVENTS, PROMOTIONS, ROOMS, REQUEST_CATEGORY_TO_DEPARTMENT, REQUEST_CATEGORY_TO_ROLE, ROLE_SURFACES,
} from '../data/mockData';
import { supabase } from '../lib/supabase';
import {
  loadGuestData,
  createServiceRequest as createRemoteServiceRequest,
  updateServiceRequest as updateRemoteServiceRequest,
  bookActivity as bookRemoteActivity,
  updateGuestProfile as updateRemoteGuestProfile,
  createFeedback as createRemoteFeedback,
  completeGuestCheckIn as completeRemoteGuestCheckIn,
  setHousekeepingPreference as setRemoteHousekeepingPreference,
  registerPushToken as registerRemotePushToken,
  searchAvailableRooms as searchRemoteAvailableRooms,
  createReservation as createRemoteReservation,
  sendConciergeMessage as sendRemoteConciergeMessage,
  loadConciergeMessages as loadRemoteConciergeMessages,
} from '../services/supabaseData';
import {
  loadStaffData, loadStaffDirectory, writeAuditEntry,
  assignServiceRequest as assignRemoteServiceRequest,
  addServiceRequestNote as addRemoteServiceRequestNote,
  createActivity as createRemoteActivity,
  createEvent as createRemoteEvent,
  publishEvent as publishRemoteEvent,
  createPromotion as createRemotePromotion,
  publishPromotion as publishRemotePromotion,
  archivePromotion as archiveRemotePromotion,
  updateRoomStatus as updateRemoteRoomStatus,
  createMaintenanceIssue as createRemoteMaintenanceIssue,
  updateMaintenanceStatus as updateRemoteMaintenanceStatus,
  resolveFeedback as resolveRemoteFeedback,
  setContentStatus as setRemoteContentStatus,
  notifyStaffRole,
  markNotificationRead as markRemoteNotificationRead,
  markAllStaffNotificationsRead as markAllRemoteStaffNotificationsRead,
  sendEmergencyBroadcast as sendRemoteEmergencyBroadcast,
  searchAvailableRoomsStaff as searchRemoteAvailableRoomsStaff,
  createReservationForGuest as createRemoteReservationForGuest,
  createGuestProfile as createRemoteGuestProfile,
  loadConciergeConversationMessages as loadRemoteStaffConciergeThread,
  replyToConciergeConversation as replyToRemoteConciergeConversation,
  resolveConciergeConversation as resolveRemoteConciergeConversation,
} from '../services/supabaseStaffData';

const BIOMETRIC_PREF_KEY = 'oo_biometric_enabled';
const ONBOARDING_STORAGE_KEY = 'oo_has_onboarded';
const CONCIERGE_CONVERSATION_KEY = 'oo_concierge_conversation_id';
// Where Supabase email links (magic-link sign-in, password reset) send the
// user back to. Must also be added to the redirect URL allowlist in the
// Supabase dashboard (Authentication -> URL Configuration) — a build-time
// URL isn't something the app can register there itself.
const AUTH_CALLBACK_URL = ExpoLinking.createURL('auth-callback');

const AppContext = createContext(null);

let idCounter = 1000;
const nextId = (prefix) => `${prefix}_${idCounter++}`;

// -----------------------------------------------------------------------
// This is the single shared data layer for all three experiences in this
// app — Guest, Staff, and Management. Because they're screens inside one
// React Native app sharing one Context, an action taken in any one of them
// (a guest submits a request, staff marks it complete, management publishes
// a promotion) is instantly visible in the others via ordinary React state
// updates — no polling, no separate backend to keep in sync, because there
// is only ever one copy of the data. In production this Context's mutation
// functions are exactly where real API calls (e.g. Supabase) would go;
// every screen already calls them by name rather than touching state
// directly, so swapping the internals later doesn't require screen changes.
// -----------------------------------------------------------------------

export function AppProvider({ children }) {
  const [authSession, setAuthSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  // Whether the persisted onboarding flag has finished loading — RootNavigator
  // waits on this (alongside authLoading) before deciding what to show, so a
  // returning guest who already onboarded doesn't get flashed the onboarding
  // screen again every cold start while AsyncStorage is still being read.
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(ONBOARDING_STORAGE_KEY).then((value) => {
      if (!mounted) return;
      if (value === 'true') setHasOnboarded(true);
      setOnboardingChecked(true);
    }).catch(() => {
      if (mounted) setOnboardingChecked(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(CONCIERGE_CONVERSATION_KEY).then((value) => {
      if (value) setConciergeConversationId(value);
    }).catch(() => {});
  }, []);

  // Which top-level experience is active: null (picker), 'guest', 'staff', 'management'.
  const [experience, setExperience] = useState(null);

  // Guest-facing auth. Derived from authSession itself (not a separately
  // tracked flag) so a session Supabase silently restores on cold start —
  // e.g. behind a biometric lock — counts as authenticated immediately,
  // instead of forcing the guest back through ExperienceSelect + full
  // email/password sign-in even though they're already signed in.
  const isAuthenticated = !!authSession?.user?.id;

  // Staff/Management auth — one session shape, gated by role per surface.
  const [opsSession, setOpsSession] = useState(null); // { id, name, role, department }

  // Biometric app-lock. Supabase already persists the auth session across
  // restarts (see src/lib/supabase.js) — biometrics here don't replace
  // password login, they gate re-*revealing* an already-valid persisted
  // session behind Face ID / fingerprint / iris, the same pattern banking
  // apps use. biometricLockActive starts false and is only ever flipped to
  // true by the startup effect below, once, if the preference is on.
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLockActive, setBiometricLockActive] = useState(false);

  // Set when a password-reset email link lands back in the app — Supabase
  // signs the recovery link's session in immediately (isAuthenticated would
  // otherwise flip true and RootNavigator would route straight into the
  // main app, skipping the "choose a new password" step entirely).
  const [passwordRecoveryActive, setPasswordRecoveryActive] = useState(false);

  const [guest, setGuest] = useState(GUEST);
  const [reservation, setReservation] = useState(RESERVATION);

  const [itinerary, setItinerary] = useState([]);
  const [serviceRequests, setServiceRequests] = useState(INITIAL_SERVICE_REQUESTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [savedActivityIds, setSavedActivityIds] = useState([]);
  // Derived from the reservation's own status rather than tracked separately,
  // so a guest who's already checked in (digitally in a prior session, or by
  // front-desk staff) never sees a stale "complete check-in" prompt.
  const checkedIn = reservation?.status === 'checked_in';

  // Shared catalog data — guest screens read these; staff/management write them.
  const [activities, setActivities] = useState(ACTIVITIES);
  const [activityBookings, setActivityBookings] = useState([]);
  const [events, setEvents] = useState(EVENTS);
  const [promotions, setPromotions] = useState(PROMOTIONS);

  // Operations data
  const [rooms, setRooms] = useState(ROOMS);

  // The guest's own room — derived from their reservation against the loaded
  // room list rather than a fixed value, so real guests see their actual
  // room instead of the demo's room 204.
  const room = useMemo(
    () => rooms.find((r) => r.id === reservation?.roomId) || ROOM,
    [rooms, reservation?.roomId]
  );
  const [maintenanceIssues, setMaintenanceIssues] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [staffNotifications, setStaffNotifications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [propertySettings, setPropertySettings] = useState({ lowRatingThreshold: 3 });
  const [staffDirectory, setStaffDirectory] = useState([]);
  const [allGuestsForStaff, setAllGuestsForStaff] = useState([]);
  // The guest's own AI concierge thread — persisted so reopening the
  // Concierge tab resumes the same conversation instead of starting a new
  // one every time. Staff-side conversation list (all guests) is separate,
  // in conciergeConversations below.
  const [conciergeConversationId, setConciergeConversationId] = useState(null);
  const [conciergeConversations, setConciergeConversations] = useState([]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setAuthSession(data.session);
        setAuthLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthSession(session);
      setAuthLoading(false);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecoveryActive(true);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Handles the app being opened from a Supabase auth email link (magic-link
  // sign-in or password reset) — both use the "implicit" flow, which returns
  // the session as a URL fragment (#access_token=...&refresh_token=...&type=...)
  // rather than a query param, so it has to be parsed out manually here and
  // handed to setSession(); the client itself has detectSessionInUrl:false
  // since that Supabase feature assumes a browser's window.location, which
  // doesn't exist in React Native.
  useEffect(() => {
    const handleUrl = (url) => {
      if (!url) return;
      const fragment = url.split('#')[1];
      if (!fragment) return;
      const params = new URLSearchParams(fragment);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).catch(() => {});
      }
    };
    ExpoLinking.getInitialURL().then(handleUrl).catch(() => {});
    const sub = ExpoLinking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  const refreshGuestData = useCallback(async () => {
    if (!authSession?.user?.id) return { ok: false, error: 'Authentication required.' };
    setDataLoading(true);
    setDataError(null);
    try {
      const data = await loadGuestData(authSession.user.id);
      if (data.guest) setGuest(data.guest);
      if (data.reservation) setReservation(data.reservation);
      setRooms(data.rooms);
      setServiceRequests(data.serviceRequests);
      setActivityBookings(data.activityBookings);
      setFeedback(data.feedback);
      setNotifications(data.notifications);
      setActivities(data.activities);
      setEvents(data.events);
      setPromotions(data.promotions);
      return { ok: true };
    } catch (error) {
      setDataError('We could not load your latest stay data. Please retry.');
      return { ok: false, error: 'Unable to load your latest stay data.' };
    } finally {
      setDataLoading(false);
    }
  }, [authSession?.user?.id]);

  const refreshStaffData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [staffData, directory] = await Promise.all([loadStaffData(), loadStaffDirectory()]);
      setServiceRequests(staffData.serviceRequests);
      setRooms(staffData.rooms);
      setActivities(staffData.activities);
      setEvents(staffData.events);
      setPromotions(staffData.promotions);
      setActivityBookings(staffData.activityBookings);
      setMaintenanceIssues(staffData.maintenanceIssues);
      setFeedback(staffData.feedback);
      setContentItems(staffData.contentItems);
      setAuditLog(staffData.auditLog);
      setStaffNotifications(staffData.staffNotifications);
      setAllGuestsForStaff(staffData.allGuestsForStaff);
      setConciergeConversations(staffData.conciergeConversations);
      setStaffDirectory(directory);
      return { ok: true };
    } catch (error) {
      setDataError('We could not load the latest operations data. Please retry.');
      return { ok: false, error: 'Unable to load operations data.' };
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Every authenticated session is either a guest or a staff member — decided
  // by whether their profiles.role is set — and loads the matching data. A
  // single bare "always load guest data" effect would wipe staff dashboards
  // (rooms, requests, etc.) the moment a staff member signs in.
  useEffect(() => {
    let mounted = true;
    async function resolveSession() {
      if (!authSession?.user?.id) {
        setOpsSession(null);
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authSession.user.id).maybeSingle();
      if (!mounted) return;
      if (profile?.role) {
        setOpsSession({ id: profile.id, name: `${profile.first_name} ${profile.last_name}`.trim(), role: profile.role, department: profile.department });
        setExperience((current) => current || ROLE_SURFACES[profile.role]?.[0] || 'staff');
        await refreshStaffData();
      } else {
        setOpsSession(null);
        setExperience((current) => current || 'guest');
        await refreshGuestData();
      }
    }
    resolveSession();
    return () => {
      mounted = false;
    };
  }, [authSession?.user?.id, refreshGuestData, refreshStaffData]);

  // Register this device's Expo push token once signed in, so emergency
  // broadcasts (and, in future, other alerts) reach this device even when
  // the app is backgrounded. Best-effort: a denied permission or a device
  // without push support (e.g. a simulator) should never block anything
  // else in the app.
  useEffect(() => {
    if (!authSession?.user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('emergency', {
            name: 'Emergency Alerts',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'default',
          });
        }
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
        if (!cancelled && token) {
          await registerRemotePushToken(authSession.user.id, token, Platform.OS);
        }
      } catch (error) {
        // No push hardware/support (e.g. some emulators) — non-fatal.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authSession?.user?.id]);

  // On cold start, if the guest previously opted into Face ID/fingerprint
  // unlock, lock the app until they clear that prompt — even though
  // Supabase already silently restored their session from storage.
  useEffect(() => {
    (async () => {
      const pref = await SecureStore.getItemAsync(BIOMETRIC_PREF_KEY).catch(() => null);
      const hasHardware = await LocalAuthentication.hasHardwareAsync().catch(() => false);
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync().catch(() => false) : false;
      setBiometricSupported(hasHardware && isEnrolled);
      if (pref === 'true' && hasHardware && isEnrolled) {
        setBiometricEnabled(true);
        setBiometricLockActive(true);
      }
    })();
  }, []);

  const enableBiometricLogin = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
    if (!hasHardware || !isEnrolled) {
      return { ok: false, error: 'Face ID / fingerprint is not set up on this device.' };
    }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm to enable Face ID sign-in' });
    if (!result.success) return { ok: false, error: 'Could not verify your identity.' };
    await SecureStore.setItemAsync(BIOMETRIC_PREF_KEY, 'true');
    setBiometricEnabled(true);
    return { ok: true };
  }, []);

  const disableBiometricLogin = useCallback(async () => {
    await SecureStore.deleteItemAsync(BIOMETRIC_PREF_KEY).catch(() => {});
    setBiometricEnabled(false);
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Sign in to Ocean Oasis' });
    if (result.success) {
      setBiometricLockActive(false);
      return { ok: true };
    }
    return { ok: false, error: 'Could not verify your identity.' };
  }, []);

  const unlockWithPasswordFallback = useCallback(async () => {
    await disableBiometricLogin();
    await supabase.auth.signOut();
    setBiometricLockActive(false);
  }, [disableBiometricLogin]);

  useEffect(() => {
    if (!authSession?.user?.id || !guest?.id || guest.id === GUEST.id) return undefined;
    const channel = supabase
      .channel(`service-request-updates-${guest.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests', filter: `guest_id=eq.${guest.id}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setServiceRequests((prev) => prev.filter((item) => item.id !== payload.old?.id));
          return;
        }
        const row = payload.new;
        if (!row?.id) return;
        setServiceRequests((prev) => {
          const next = {
            ...row,
            assignedStaffId: row.assigned_staff_id || null,
            createdAt: row.created_at || row.createdAt,
            completedAt: row.completed_at || row.completedAt,
          };
          const exists = prev.some((item) => item.id === next.id);
          return exists ? prev.map((item) => (item.id === next.id ? { ...item, ...next } : item)) : [next, ...prev];
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [authSession?.user?.id, guest?.id]);

  // Staff-side realtime: live-sync the ops dashboards across signed-in staff.
  useEffect(() => {
    if (!opsSession) return undefined;
    const channel = supabase
      .channel(`staff-ops-${opsSession.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setServiceRequests((prev) => prev.filter((item) => item.id !== payload.old?.id));
          return;
        }
        const row = payload.new;
        if (!row?.id) return;
        setServiceRequests((prev) => {
          const exists = prev.some((item) => item.id === row.id);
          const next = { assignedStaffId: row.assigned_staff_id || null, createdAt: row.created_at, completedAt: row.completed_at, ...row };
          return exists ? prev.map((item) => (item.id === row.id ? { ...item, ...next } : item)) : [next, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, (payload) => {
        const row = payload.new;
        if (!row?.id) return;
        setRooms((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...row } : r)));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_issues' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setMaintenanceIssues((prev) => prev.filter((item) => item.id !== payload.old?.id));
          return;
        }
        const row = payload.new;
        if (!row?.id) return;
        const next = { ...row, roomNumber: row.room_number, assignedStaffId: row.assigned_staff_id, createdAt: row.created_at, resolvedAt: row.resolved_at };
        setMaintenanceIssues((prev) => {
          const exists = prev.some((item) => item.id === row.id);
          return exists ? prev.map((item) => (item.id === row.id ? next : item)) : [next, ...prev];
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const row = payload.new;
        // Only role-broadcast rows belong on the staff feed — personal guest
        // notifications (recipient_user_id set) are excluded, matching the
        // filter loadStaffData() already applies on the initial load.
        if (!row?.id || !row.recipient_role) return;
        setStaffNotifications((prev) => (prev.some((n) => n.id === row.id) ? prev : [{ ...row, createdAt: row.created_at }, ...prev]));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'concierge_conversations' }, (payload) => {
        const row = payload.new;
        if (!row?.id) return;
        setConciergeConversations((prev) => {
          const exists = prev.some((c) => c.id === row.id);
          if (exists) {
            return prev.map((c) => (c.id === row.id ? { ...c, status: row.status, escalatedRequestId: row.escalated_request_id, lastMessageAt: row.last_message_at } : c));
          }
          // A brand-new conversation from realtime alone has no joined guest
          // name yet (the raw payload doesn't include it) — the next full
          // refreshStaffData() fills it in; showing it nameless in the
          // meantime still surfaces that a guest needs attention.
          return [{ id: row.id, guestId: row.guest_id, guestName: '', status: row.status, escalatedRequestId: row.escalated_request_id, createdAt: row.created_at, lastMessageAt: row.last_message_at }, ...prev];
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [opsSession]);

  // ---------------------------------------------------------------------
  // Onboarding / experience switching
  // ---------------------------------------------------------------------
  const completeOnboarding = useCallback((interests) => {
    setGuest((g) => ({ ...g, interests: interests || [] }));
    setHasOnboarded(true);
    AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true').catch(() => {});
  }, []);

  const chooseExperience = useCallback((exp) => setExperience(exp), []);
  const exitToExperiencePicker = useCallback(() => {
    setExperience(null);
    setOpsSession(null);
  }, []);

  // ---------------------------------------------------------------------
  // Guest auth
  // ---------------------------------------------------------------------
  const signIn = useCallback(async (email, password) => {
    if (!email || !password) {
      return { ok: false, error: 'Enter your email and password.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);
  const signUp = useCallback(async ({ email, password, firstName, lastName }) => {
    // Carries the interests picked during onboarding (local-only until now)
    // into the new auth user's metadata, so the handle_new_user() DB
    // trigger can seed them onto the real guests row at creation time —
    // otherwise they were silently discarded the moment a guest signed up.
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName, last_name: lastName, interests: guest.interests || [] } },
    });
    return { ok: !error, error: error?.message, data };
  }, [guest.interests]);
  const sendMagicLink = useCallback(async (email) => {
    if (!email?.trim()) return { ok: false, error: 'Enter your email address.' };
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: AUTH_CALLBACK_URL },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setExperience(null);
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    if (!email?.trim()) return { ok: false, error: 'Enter your email address.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: AUTH_CALLBACK_URL });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  // Completes a password-reset flow after the recovery link has landed back
  // in the app (see the deep-link effect above) and Supabase has signed in
  // the temporary recovery session — this is the step ForgotPasswordScreen's
  // "send reset link" had no counterpart for until now.
  const completePasswordRecovery = useCallback(async (newPassword) => {
    if (!newPassword || newPassword.length < 8) {
      return { ok: false, error: 'Password must be at least 8 characters.' };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    setPasswordRecoveryActive(false);
    return { ok: true };
  }, []);

  const updateGuest = useCallback(async (changes) => {
    if (authSession?.user?.id && guest.id !== GUEST.id) {
      try {
        const remoteChanges = {};
        if (changes.firstName !== undefined) remoteChanges.first_name = changes.firstName;
        if (changes.lastName !== undefined) remoteChanges.last_name = changes.lastName;
        if (changes.phone !== undefined) remoteChanges.phone = changes.phone;
        if (changes.interests !== undefined) remoteChanges.interests = changes.interests;
        // guests.email is a contact field, distinct from the Auth login
        // email — changing the actual sign-in identity needs
        // supabase.auth.updateUser() plus a confirmation-email flow this
        // app doesn't have yet, so this intentionally only updates the
        // contact copy, not the login credential.
        if (changes.email !== undefined) remoteChanges.email = changes.email;
        const persistedGuest = await updateRemoteGuestProfile(guest.id, remoteChanges);
        setGuest(persistedGuest);
        return { ok: true, data: persistedGuest };
      } catch (error) {
        return { ok: false, error: 'Your profile could not be saved. Please try again.' };
      }
    }
    setGuest((previous) => ({ ...previous, ...changes }));
    return { ok: true };
  }, [authSession?.user?.id, guest.id]);

  // ---------------------------------------------------------------------
  // Staff / Management auth
  // ---------------------------------------------------------------------
  const canAccessSurface = useCallback((role, surface) => (ROLE_SURFACES[role] || []).includes(surface), []);

  const opsSignIn = useCallback(async (email, password, surface) => {
    if (!email || !password) return { ok: false, error: 'Enter your email and password.' };
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) return { ok: false, error: authError.message };
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userData?.user?.id).maybeSingle();
    if (profileError || !profile?.role || !canAccessSurface(profile.role, surface)) {
      await supabase.auth.signOut();
      setOpsSession(null);
      return { ok: false, error: 'This account does not have access to this dashboard.' };
    }
    setOpsSession({ id: profile.id, name: `${profile.first_name} ${profile.last_name}`.trim(), role: profile.role, department: profile.department });
    return { ok: true };
  }, [canAccessSurface]);

  const opsSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setOpsSession(null);
    setExperience(null);
  }, []);

  const logAudit = useCallback((action, metadata) => {
    if (!opsSession) return;
    writeAuditEntry(opsSession.id, opsSession.name, opsSession.role, action, metadata || {}).catch(() => {});
  }, [opsSession]);

  // ---------------------------------------------------------------------
  // Itinerary
  // ---------------------------------------------------------------------
  const addToItinerary = useCallback((item) => {
    setItinerary((prev) => {
      if (prev.some((i) => i.refId === item.refId && i.type === item.type)) return prev;
      return [...prev, { id: nextId('it'), ...item }].sort((a, b) =>
        `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
      );
    });
  }, []);
  const removeFromItinerary = useCallback((id) => {
    setItinerary((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // ---------------------------------------------------------------------
  // Service Requests — shared between Guest ("Requests") and Staff ("Requests")
  // ---------------------------------------------------------------------
  const submitServiceRequest = useCallback(async (request) => {
    const category = request.category;
    const department = REQUEST_CATEGORY_TO_DEPARTMENT[category] || 'Front Desk';
    const newRequest = {
      status: 'Received',
      createdAt: new Date().toISOString(),
      roomNumber: room.number,
      guestName: `${guest.firstName} ${guest.lastName}`,
      department,
      priority: category === 'Maintenance' ? 'HIGH' : 'NORMAL',
      assignedStaffName: null,
      notes: [],
      ...request,
    };
    if (authSession?.user?.id && guest.id !== GUEST.id) {
      try {
        const persistedRequest = await createRemoteServiceRequest(guest.id, room.number, { ...request, department });
        setServiceRequests((prev) => [persistedRequest, ...prev]);
        const role = REQUEST_CATEGORY_TO_ROLE[category] || 'FRONT_DESK';
        notifyStaffRole(role, { category: 'Requests', title: 'New guest request', body: `${category} — Room ${room.number}` }).catch(() => {});
        return { ok: true, data: persistedRequest };
      } catch (error) {
        return { ok: false, error: 'Your request could not be submitted. Please try again.' };
      }
    }
    setServiceRequests((prev) => [newRequest, ...prev]);
    setStaffNotifications((prev) => [{ id: nextId('sn'), title: 'New guest request', body: `${category} — Room ${room.number}`, category: 'Requests', createdAt: new Date().toISOString(), read: false }, ...prev]);
    return { ok: true, data: newRequest };
  }, [room, guest, authSession?.user?.id]);

  // Sends one guest turn to the AI concierge (supabase/functions/concierge-chat)
  // and returns its reply. conciergeConversationId is threaded through and
  // persisted so the same conversation resumes next time the guest opens
  // the Concierge tab, rather than starting fresh every time.
  const sendConciergeMessage = useCallback(async (message, faqContext) => {
    try {
      const result = await sendRemoteConciergeMessage(conciergeConversationId, message, faqContext);
      if (result?.conversationId && result.conversationId !== conciergeConversationId) {
        setConciergeConversationId(result.conversationId);
        AsyncStorage.setItem(CONCIERGE_CONVERSATION_KEY, result.conversationId).catch(() => {});
      }
      return { ok: true, data: result };
    } catch (error) {
      return { ok: false, error: 'Our concierge is unavailable right now — please try again in a moment.' };
    }
  }, [conciergeConversationId]);

  const loadConciergeThread = useCallback(async () => {
    if (!conciergeConversationId) return [];
    try {
      return await loadRemoteConciergeMessages(conciergeConversationId);
    } catch (error) {
      return [];
    }
  }, [conciergeConversationId]);

  const loadStaffConciergeThread = useCallback(async (conversationId) => {
    try {
      return await loadRemoteStaffConciergeThread(conversationId);
    } catch (error) {
      return [];
    }
  }, []);

  const replyToConcierge = useCallback(async (conversationId, text) => {
    if (!opsSession?.id) return { ok: false, error: 'Sign in required.' };
    try {
      const updated = await replyToRemoteConciergeConversation(conversationId, opsSession.id, text);
      setConciergeConversations((prev) => prev.map((c) => (c.id === conversationId ? updated : c)));
      return { ok: true, data: updated };
    } catch (error) {
      return { ok: false, error: 'Could not send your reply. Please try again.' };
    }
  }, [opsSession?.id]);

  const resolveConcierge = useCallback(async (conversationId) => {
    try {
      const updated = await resolveRemoteConciergeConversation(conversationId);
      setConciergeConversations((prev) => prev.map((c) => (c.id === conversationId ? updated : c)));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not resolve this conversation.' };
    }
  }, []);

  const assignRequestToStaff = useCallback(async (requestId, staffId) => {
    // service_requests already has a DB audit trigger — no separate logAudit call needed.
    const current = serviceRequests.find((r) => r.id === requestId);
    try {
      const updated = await assignRemoteServiceRequest(requestId, staffId, current?.status);
      setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, ...updated } : r)));
      return { ok: true, data: updated };
    } catch (error) {
      return { ok: false, error: 'The request could not be assigned. Please try again.' };
    }
  }, [serviceRequests]);

  const updateRequestStatus = useCallback(async (requestId, status) => {
    if (authSession?.user?.id && (opsSession || guest.id !== GUEST.id)) {
      try {
        const persistedRequest = await updateRemoteServiceRequest(requestId, { status, completed_at: status === 'Completed' ? new Date().toISOString() : null });
        setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, ...persistedRequest } : r)));
        return { ok: true, data: persistedRequest };
      } catch (error) {
        return { ok: false, error: 'The request status could not be updated.' };
      }
    }
    setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status, completedAt: status === 'Completed' ? new Date().toISOString() : r.completedAt } : r)));
    return { ok: true };
  }, [authSession?.user?.id, guest.id, opsSession]);

  const addRequestNote = useCallback(async (requestId, text) => {
    try {
      const updated = await addRemoteServiceRequestNote(requestId, text, opsSession?.name || 'Staff');
      setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, ...updated } : r)));
      return { ok: true, data: updated };
    } catch (error) {
      return { ok: false, error: 'The note could not be saved. Please try again.' };
    }
  }, [opsSession]);

  // ---------------------------------------------------------------------
  // Activities — Staff/Management create & see bookings; Guest books.
  // ---------------------------------------------------------------------
  const toggleSavedActivity = useCallback((activityId) => {
    setSavedActivityIds((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
    );
  }, []);

  const createActivity = useCallback(async (payload) => {
    try {
      const activity = await createRemoteActivity(payload, opsSession?.id || null);
      setActivities((prev) => [activity, ...prev]);
      logAudit(`Created activity "${payload.name}"`);
      return { ok: true, data: activity };
    } catch (error) {
      return { ok: false, error: 'The activity could not be created. Please try again.' };
    }
  }, [logAudit, opsSession]);

  const bookActivity = useCallback(async ({ activityId, guests }) => {
    if (authSession?.user?.id && guest.id !== GUEST.id) {
      try {
        const booking = await bookRemoteActivity(activityId, guests);
        // The RPC response has no guest name/room (those live on `guests`, not
        // `activity_bookings`) — attach them from context so the booking is
        // fully shaped the same way staff-loaded bookings are, whichever
        // dashboard reads this array next.
        const enrichedBooking = { ...booking, guestName: `${guest.firstName} ${guest.lastName}`.trim(), roomNumber: room.number };
        setActivityBookings((prev) => [enrichedBooking, ...prev]);
        const activity = activities.find((a) => a.id === activityId);
        notifyStaffRole('ACTIVITIES_MANAGER', { category: 'Activities', title: 'New activity booking', body: `${activity?.name || 'Activity'} — ${guests} guest(s)` }).catch(() => {});
        return { ok: true, booking: enrichedBooking };
      } catch (error) {
        const message = error?.message?.toLowerCase().includes('full')
          ? 'This activity is now full.'
          : error?.message?.toLowerCase().includes('already booked')
            ? 'You already have a booking for this activity.'
            : 'This activity could not be booked. Please try again.';
        return { ok: false, error: message };
      }
    }
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return { ok: false, error: 'Activity not found.' };
    const alreadyBooked = activityBookings.filter((b) => b.activityId === activityId).reduce((sum, b) => sum + b.guests, 0);
    const capacity = activity.capacity || 999;
    if (alreadyBooked + guests > capacity) return { ok: false, error: 'Not enough capacity remaining for this activity.' };
    const booking = { id: nextId('ab'), activityId, guestName: `${guest.firstName} ${guest.lastName}`, roomNumber: room.number, guests, amount: (activity.priceValue || 0) * guests, createdAt: new Date().toISOString() };
    setActivityBookings((prev) => [...prev, booking]);
    setStaffNotifications((prev) => [{ id: nextId('sn'), title: 'New activity booking', body: `${activity.name} — ${guests} guest(s)`, category: 'Activities', createdAt: new Date().toISOString(), read: false }, ...prev]);
    return { ok: true, booking };
  }, [activities, activityBookings, guest, room, authSession?.user?.id]);

  // ---------------------------------------------------------------------
  // Events — Staff/Management create as DRAFT, publish to Guest calendar.
  // ---------------------------------------------------------------------
  const createEvent = useCallback(async (payload) => {
    try {
      const event = await createRemoteEvent(payload, opsSession?.id || null);
      setEvents((prev) => [event, ...prev]);
      logAudit(`Created event "${payload.title}"`);
      return { ok: true, data: event };
    } catch (error) {
      return { ok: false, error: 'The event could not be created. Please try again.' };
    }
  }, [logAudit, opsSession]);

  const publishEvent = useCallback(async (eventId) => {
    try {
      const event = await publishRemoteEvent(eventId);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...event } : e)));
      logAudit(`Published event #${eventId} — now visible to guests`);
      return { ok: true, data: event };
    } catch (error) {
      return { ok: false, error: 'The event could not be published. Please try again.' };
    }
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Promotions — Management CMS, published to Guest App.
  // ---------------------------------------------------------------------
  const createPromotion = useCallback(async (payload) => {
    try {
      const promo = await createRemotePromotion(payload, opsSession?.id || null);
      setPromotions((prev) => [promo, ...prev]);
      logAudit(`Created promotion "${payload.title}"`);
      return { ok: true, data: promo };
    } catch (error) {
      return { ok: false, error: 'The promotion could not be created. Please try again.' };
    }
  }, [logAudit, opsSession]);

  const publishPromotion = useCallback(async (promoId) => {
    try {
      const promo = await publishRemotePromotion(promoId);
      setPromotions((prev) => prev.map((p) => (p.id === promoId ? { ...p, ...promo } : p)));
      logAudit(`Published promotion #${promoId} — now visible to guests`);
      return { ok: true, data: promo };
    } catch (error) {
      return { ok: false, error: 'The promotion could not be published. Please try again.' };
    }
  }, [logAudit]);

  const archivePromotion = useCallback(async (promoId) => {
    try {
      const promo = await archiveRemotePromotion(promoId);
      setPromotions((prev) => prev.map((p) => (p.id === promoId ? { ...p, ...promo } : p)));
      logAudit(`Archived promotion #${promoId}`);
      return { ok: true, data: promo };
    } catch (error) {
      return { ok: false, error: 'The promotion could not be archived. Please try again.' };
    }
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Rooms / Housekeeping
  // ---------------------------------------------------------------------
  const updateRoomStatus = useCallback(async (roomId, status) => {
    // rooms already has a DB audit trigger — no separate logAudit call needed.
    try {
      const updated = await updateRemoteRoomStatus(roomId, status);
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...updated } : r)));
      return { ok: true, data: updated };
    } catch (error) {
      return { ok: false, error: 'The room status could not be updated. Please try again.' };
    }
  }, []);

  // ---------------------------------------------------------------------
  // Maintenance
  // ---------------------------------------------------------------------
  const createMaintenanceIssue = useCallback(async (payload) => {
    try {
      const issue = await createRemoteMaintenanceIssue(payload);
      setMaintenanceIssues((prev) => [issue, ...prev]);
      logAudit(`Logged maintenance issue in room ${payload.roomNumber}`);
      return { ok: true, data: issue };
    } catch (error) {
      return { ok: false, error: 'The maintenance issue could not be logged. Please try again.' };
    }
  }, [logAudit]);

  const updateMaintenanceStatus = useCallback(async (issueId, status) => {
    try {
      const issue = await updateRemoteMaintenanceStatus(issueId, status);
      setMaintenanceIssues((prev) => prev.map((m) => (m.id === issueId ? { ...m, ...issue } : m)));
      logAudit(`Maintenance issue #${issueId} → ${status}`);
      return { ok: true, data: issue };
    } catch (error) {
      return { ok: false, error: 'The maintenance status could not be updated. Please try again.' };
    }
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Feedback — shared: guest submits, staff/management see & resolve.
  // ---------------------------------------------------------------------
  const submitFeedback = useCallback(async (data) => {
    const overall = data.ratings?.['Overall Experience'] || 0;
    const resolved = overall > (propertySettings.lowRatingThreshold || 3);

    if (authSession?.user?.id && guest.id !== GUEST.id) {
      try {
        const persisted = await createRemoteFeedback(guest.id, { overall, ratings: data.ratings, comments: data.comments, resolved });
        const entry = { ...persisted, guestName: `${guest.firstName} ${guest.lastName}`.trim(), roomNumber: room.number };
        setFeedback((prev) => [entry, ...prev]);
        if (!resolved) {
          notifyStaffRole('MANAGEMENT', { category: 'Feedback', title: 'Guest experience alert', body: `Room ${room.number} rated ${overall}/5` }).catch(() => {});
        }
        return entry;
      } catch (error) {
        return { error: error?.message || 'Your feedback could not be submitted. Please try again.' };
      }
    }

    const entry = {
      id: nextId('fb'),
      guestName: `${guest.firstName} ${guest.lastName}`,
      roomNumber: room.number,
      overall,
      ratings: data.ratings,
      comments: data.comments,
      createdAt: new Date().toISOString(),
      resolved,
      resolutionNote: '',
    };
    setFeedback((prev) => [entry, ...prev]);
    if (!resolved) {
      setStaffNotifications((prev) => [{ id: nextId('sn'), title: 'Guest experience alert', body: `Room ${room.number} rated ${overall}/5`, category: 'Feedback', createdAt: new Date().toISOString(), read: false }, ...prev]);
    }
    return entry;
  }, [guest, room, propertySettings, authSession?.user?.id]);

  const resolveFeedback = useCallback(async (feedbackId, note) => {
    try {
      const entry = await resolveRemoteFeedback(feedbackId, note);
      setFeedback((prev) => prev.map((f) => (f.id === feedbackId ? { ...f, ...entry } : f)));
      logAudit(`Resolved feedback #${feedbackId}`);
      return { ok: true, data: entry };
    } catch (error) {
      return { ok: false, error: 'The feedback could not be resolved. Please try again.' };
    }
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Content CMS
  // ---------------------------------------------------------------------
  const setContentStatus = useCallback(async (contentId, status) => {
    try {
      const item = await setRemoteContentStatus(contentId, status);
      setContentItems((prev) => prev.map((c) => (c.id === contentId ? { ...c, ...item } : c)));
      logAudit(`Content "#${contentId}" set to ${status}`);
      return { ok: true, data: item };
    } catch (error) {
      return { ok: false, error: 'The content status could not be updated. Please try again.' };
    }
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Notifications (guest + staff, kept separate since they're different audiences)
  // ---------------------------------------------------------------------
  const markNotificationRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (authSession?.user?.id) {
      try {
        await markRemoteNotificationRead(id);
      } catch (error) {
        // Non-critical — the badge count just stays stale until the next refresh.
      }
    }
  }, [authSession?.user?.id]);
  const markAllNotificationsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (authSession?.user?.id && unreadIds.length) {
      try {
        await markAllRemoteStaffNotificationsRead(unreadIds);
      } catch (error) {
        // Non-critical — the badge count just stays stale until the next refresh.
      }
    }
  }, [authSession?.user?.id, notifications]);
  const markStaffNotificationRead = useCallback(async (id) => {
    try {
      await markRemoteNotificationRead(id);
      setStaffNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      // Non-critical — the badge count just stays stale until the next refresh.
    }
  }, []);
  const markAllStaffNotificationsRead = useCallback(async () => {
    const unreadIds = staffNotifications.filter((n) => !n.read).map((n) => n.id);
    try {
      await markAllRemoteStaffNotificationsRead(unreadIds);
      setStaffNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      // Non-critical — the badge count just stays stale until the next refresh.
    }
  }, [staffNotifications]);

  // `details` (arrivalTime/transport/specialRequests from the check-in
  // form) has no backing column on reservations yet — complete_guest_checkin
  // only ever flips status — so it's merged into local reservation state
  // client-side after the status flip, same as the local-only branch below.
  // Real persistence (surviving a reinstall/re-auth) needs a migration to
  // add those columns and pass them through the RPC.
  const completeDigitalCheckIn = useCallback(async (details) => {
    if (authSession?.user?.id && guest.id !== GUEST.id && reservation?.id) {
      try {
        const updated = await completeRemoteGuestCheckIn(reservation.id);
        setReservation((r) => ({ ...r, ...updated, ...(details || {}) }));
        return { ok: true };
      } catch (error) {
        return { ok: false, error: 'Check-in could not be completed. Please try again.' };
      }
    }
    setReservation((r) => ({ ...r, status: 'checked_in', ...(details || {}) }));
    return { ok: true };
  }, [authSession?.user?.id, guest?.id, reservation?.id]);

  const setHousekeepingPreference = useCallback(async (preference) => {
    if (authSession?.user?.id && guest.id !== GUEST.id && reservation?.id) {
      try {
        const updated = await setRemoteHousekeepingPreference(reservation.id, preference);
        setReservation((r) => ({ ...r, ...updated }));
        return { ok: true };
      } catch (error) {
        return { ok: false, error: 'Your preference could not be saved. Please try again.' };
      }
    }
    setReservation((r) => ({ ...r, housekeepingPreference: preference }));
    return { ok: true };
  }, [authSession?.user?.id, guest?.id, reservation?.id]);

  const sendEmergencyBroadcast = useCallback(async (title, body) => {
    try {
      const count = await sendRemoteEmergencyBroadcast(title, body);
      return { ok: true, count };
    } catch (error) {
      return { ok: false, error: 'The broadcast could not be sent. Please try again.' };
    }
  }, []);

  // Room-booking engine (guest self-service).
  const searchAvailableRooms = useCallback(async (checkIn, checkOut, roomType, guests) => {
    try {
      const rooms = await searchRemoteAvailableRooms(checkIn, checkOut, roomType, guests);
      return { ok: true, rooms };
    } catch (error) {
      return { ok: false, error: error?.message || 'Could not search room availability. Please try again.' };
    }
  }, []);

  // Creates a new, separate reservation — this deliberately does NOT
  // overwrite `reservation` (the guest's current/active stay shown on My
  // Stay). A newly booked future stay is a distinct upcoming reservation;
  // screens that want to list it alongside past stays should re-fetch via
  // loadPastStays-style queries, not read it off context state.
  const createReservation = useCallback(async (payload) => {
    try {
      const reservation = await createRemoteReservation(payload);
      return { ok: true, reservation };
    } catch (error) {
      return { ok: false, error: error?.message || 'This room could not be booked. Please try again.' };
    }
  }, []);

  // Room-booking engine (staff creating a booking on a guest's behalf).
  const searchAvailableRoomsStaff = useCallback(async (checkIn, checkOut, roomType, guests) => {
    try {
      const rooms = await searchRemoteAvailableRoomsStaff(checkIn, checkOut, roomType, guests);
      return { ok: true, rooms };
    } catch (error) {
      return { ok: false, error: error?.message || 'Could not search room availability. Please try again.' };
    }
  }, []);

  const createReservationForGuest = useCallback(async (guestId, payload) => {
    try {
      const reservation = await createRemoteReservationForGuest(guestId, payload);
      return { ok: true, reservation };
    } catch (error) {
      return { ok: false, error: error?.message || 'This room could not be booked. Please try again.' };
    }
  }, []);

  const createGuestProfile = useCallback(async (payload) => {
    try {
      const guest = await createRemoteGuestProfile(payload);
      setAllGuestsForStaff((prev) => [{ id: guest.id, firstName: guest.first_name, lastName: guest.last_name, roomNumber: null, reservationNumber: null, checkIn: null, checkOut: null, housekeepingPreference: 'DAILY_CLEANING' }, ...prev]);
      return { ok: true, guest };
    } catch (error) {
      return { ok: false, error: error?.message || 'This guest profile could not be created. Please try again.' };
    }
  }, []);

  const unreadNotificationCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const unreadStaffNotificationCount = useMemo(() => staffNotifications.filter((n) => !n.read).length, [staffNotifications]);

  const value = useMemo(
    () => ({
      hasOnboarded, completeOnboarding, onboardingChecked,
      experience, chooseExperience, exitToExperiencePicker,
      isAuthenticated, authSession, authLoading, dataLoading, dataError, refreshGuestData, signIn, signUp, sendMagicLink, signOut,
      sendPasswordReset, completePasswordRecovery, passwordRecoveryActive,
      updateGuest,
      opsSession, opsSignIn, opsSignOut, canAccessSurface,
      guest, setGuest, reservation, room,
      itinerary, addToItinerary, removeFromItinerary,
      serviceRequests, submitServiceRequest, assignRequestToStaff, updateRequestStatus, addRequestNote,
      savedActivityIds, toggleSavedActivity,
      notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationCount,
      submitFeedback, feedback, resolveFeedback,
      checkedIn, completeDigitalCheckIn, setHousekeepingPreference,
      activities, createActivity, activityBookings, bookActivity,
      events, createEvent, publishEvent,
      promotions, createPromotion, publishPromotion, archivePromotion,
      rooms, updateRoomStatus,
      maintenanceIssues, createMaintenanceIssue, updateMaintenanceStatus,
      contentItems, setContentStatus,
      auditLog,
      staffNotifications, markStaffNotificationRead, markAllStaffNotificationsRead, unreadStaffNotificationCount,
      staffDirectory,
      allGuestsForStaff,
      refreshStaffData,
      propertySettings, setPropertySettings,
      sendEmergencyBroadcast,
      biometricSupported, biometricEnabled, biometricLockActive,
      enableBiometricLogin, disableBiometricLogin, unlockWithBiometrics, unlockWithPasswordFallback,
      searchAvailableRooms, createReservation,
      searchAvailableRoomsStaff, createReservationForGuest, createGuestProfile,
      conciergeConversationId, sendConciergeMessage, loadConciergeThread,
      conciergeConversations, replyToConcierge, resolveConcierge, loadStaffConciergeThread,
    }),
    [
      hasOnboarded, completeOnboarding, onboardingChecked, experience, chooseExperience, exitToExperiencePicker,
      isAuthenticated, authSession, authLoading, dataLoading, dataError, refreshGuestData, signIn, signUp, sendMagicLink, signOut,
      sendPasswordReset, completePasswordRecovery, passwordRecoveryActive,
      updateGuest, opsSession, opsSignIn, opsSignOut, canAccessSurface,
      guest, reservation, room, itinerary, addToItinerary, removeFromItinerary,
      serviceRequests, submitServiceRequest, assignRequestToStaff, updateRequestStatus, addRequestNote,
      savedActivityIds, toggleSavedActivity, notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationCount,
      submitFeedback, feedback, resolveFeedback, checkedIn, completeDigitalCheckIn, setHousekeepingPreference,
      activities, createActivity, activityBookings, bookActivity, events, createEvent, publishEvent,
      promotions, createPromotion, publishPromotion, archivePromotion, rooms, updateRoomStatus,
      maintenanceIssues, createMaintenanceIssue, updateMaintenanceStatus, contentItems, setContentStatus,
      auditLog, staffNotifications, markStaffNotificationRead, markAllStaffNotificationsRead, unreadStaffNotificationCount,
      staffDirectory, allGuestsForStaff, refreshStaffData, propertySettings, sendEmergencyBroadcast,
      biometricSupported, biometricEnabled, biometricLockActive,
      enableBiometricLogin, disableBiometricLogin, unlockWithBiometrics, unlockWithPasswordFallback,
      searchAvailableRooms, createReservation, searchAvailableRoomsStaff, createReservationForGuest, createGuestProfile,
      conciergeConversationId, sendConciergeMessage, loadConciergeThread,
      conciergeConversations, replyToConcierge, resolveConcierge, loadStaffConciergeThread,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
