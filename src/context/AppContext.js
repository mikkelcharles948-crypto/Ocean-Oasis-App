import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import {
  GUEST, RESERVATION, ROOM, INITIAL_SERVICE_REQUESTS, INITIAL_NOTIFICATIONS,
  ACTIVITIES, EVENTS, PROMOTIONS, ROOMS, STAFF_DIRECTORY, REQUEST_CATEGORY_TO_DEPARTMENT,
  INITIAL_MAINTENANCE_ISSUES, INITIAL_CONTENT_ITEMS, INITIAL_AUDIT_LOG, INITIAL_STAFF_NOTIFICATIONS,
  OTHER_GUESTS, OTHER_FEEDBACK, ROLE_SURFACES,
} from '../data/mockData';
import { supabase } from '../lib/supabase';
import {
  loadGuestData,
  createServiceRequest as createRemoteServiceRequest,
  updateServiceRequest as updateRemoteServiceRequest,
  bookActivity as bookRemoteActivity,
  updateGuestProfile as updateRemoteGuestProfile,
} from '../services/supabaseData';

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

  // Which top-level experience is active: null (picker), 'guest', 'staff', 'management'.
  const [experience, setExperience] = useState(null);

  // Guest-facing auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Staff/Management auth — one session shape, gated by role per surface.
  const [opsSession, setOpsSession] = useState(null); // { name, role, department }

  const [guest, setGuest] = useState(GUEST);
  const [reservation, setReservation] = useState(RESERVATION);
  const [room] = useState(ROOM);

  const [itinerary, setItinerary] = useState([]);
  const [serviceRequests, setServiceRequests] = useState(INITIAL_SERVICE_REQUESTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [savedActivityIds, setSavedActivityIds] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);

  // Shared catalog data — guest screens read these; staff/management write them.
  const [activities, setActivities] = useState(ACTIVITIES);
  const [activityBookings, setActivityBookings] = useState([]);
  const [events, setEvents] = useState(EVENTS);
  const [promotions, setPromotions] = useState(PROMOTIONS);

  // Operations data
  const [rooms, setRooms] = useState(ROOMS);
  const [maintenanceIssues, setMaintenanceIssues] = useState(INITIAL_MAINTENANCE_ISSUES);
  const [contentItems, setContentItems] = useState(INITIAL_CONTENT_ITEMS);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);
  const [staffNotifications, setStaffNotifications] = useState(INITIAL_STAFF_NOTIFICATIONS);
  const [feedback, setFeedback] = useState(OTHER_FEEDBACK);
  const [propertySettings, setPropertySettings] = useState({ lowRatingThreshold: 3 });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setAuthSession(data.session);
        setAuthLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
      setAuthLoading(false);
      if (!session) setIsAuthenticated(false);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
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

  useEffect(() => {
    refreshGuestData();
  }, [refreshGuestData]);

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

  // ---------------------------------------------------------------------
  // Onboarding / experience switching
  // ---------------------------------------------------------------------
  const completeOnboarding = useCallback((interests) => {
    setGuest((g) => ({ ...g, interests: interests || [] }));
    setHasOnboarded(true);
  }, []);

  const chooseExperience = useCallback((exp) => setExperience(exp), []);
  const exitToExperiencePicker = useCallback(() => {
    setExperience(null);
    setIsAuthenticated(false);
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
    setIsAuthenticated(true);
    return { ok: true };
  }, []);
  const signUp = useCallback(async ({ email, password, firstName, lastName }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    return { ok: !error, error: error?.message, data };
  }, []);
  const sendMagicLink = useCallback(async (email) => {
    if (!email?.trim()) return { ok: false, error: 'Enter your email address.' };
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setExperience(null);
  }, []);

  const updateGuest = useCallback(async (changes) => {
    if (authSession?.user?.id && guest.id !== GUEST.id) {
      try {
        const persistedGuest = await updateRemoteGuestProfile(guest.id, {
          first_name: changes.firstName,
          last_name: changes.lastName,
          phone: changes.phone,
        });
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
  const opsSignIn = useCallback((name, role) => {
    const match = STAFF_DIRECTORY.find((s) => s.name === name);
    setOpsSession({ name, role, department: match?.department || null });
  }, []);
  const opsSignOut = useCallback(() => { setOpsSession(null); setExperience(null); }, []);
  const canAccessSurface = useCallback((role, surface) => (ROLE_SURFACES[role] || []).includes(surface), []);

  const logAudit = useCallback((action, actor) => {
    setAuditLog((prev) => [{ id: nextId('log'), actorName: actor?.name || opsSession?.name || 'System', actorRole: actor?.role || opsSession?.role || 'SYSTEM', action, timestamp: new Date().toISOString() }, ...prev]);
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
        return { ok: true, data: persistedRequest };
      } catch (error) {
        return { ok: false, error: 'Your request could not be submitted. Please try again.' };
      }
    }
    setServiceRequests((prev) => [newRequest, ...prev]);
    setStaffNotifications((prev) => [{ id: nextId('sn'), title: 'New guest request', body: `${category} — Room ${room.number}`, category: 'Requests', createdAt: new Date().toISOString(), read: false }, ...prev]);
    return { ok: true, data: newRequest };
  }, [room, guest, authSession?.user?.id]);

  const assignRequestToStaff = useCallback((requestId, staffName) => {
    setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, assignedStaffName: staffName, status: r.status === 'Received' ? 'Assigned' : r.status } : r)));
    logAudit(`Assigned request #${requestId} to ${staffName}`);
  }, [logAudit]);

  const updateRequestStatus = useCallback(async (requestId, status) => {
    if (authSession?.user?.id && guest.id !== GUEST.id) {
      try {
        const persistedRequest = await updateRemoteServiceRequest(requestId, { status, completed_at: status === 'Completed' ? new Date().toISOString() : null });
        setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, ...persistedRequest } : r)));
        return { ok: true, data: persistedRequest };
      } catch (error) {
        return { ok: false, error: 'The request status could not be updated.' };
      }
    }
    setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status, completedAt: status === 'Completed' ? new Date().toISOString() : r.completedAt } : r)));
    logAudit(`Changed request #${requestId} status → ${status}`);
    return { ok: true };
  }, [logAudit, authSession?.user?.id, guest.id]);

  const addRequestNote = useCallback((requestId, text) => {
    setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, notes: [...(r.notes || []), { text, by: opsSession?.name || 'Staff', at: new Date().toISOString() }] } : r)));
  }, [opsSession]);

  // ---------------------------------------------------------------------
  // Activities — Staff/Management create & see bookings; Guest books.
  // ---------------------------------------------------------------------
  const toggleSavedActivity = useCallback((activityId) => {
    setSavedActivityIds((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
    );
  }, []);

  const createActivity = useCallback((payload) => {
    const activity = { id: nextId('a'), availability: 'Available', whatToBring: [], cancellationPolicy: 'Free cancellation up to 24 hours before the activity.', ...payload };
    setActivities((prev) => [activity, ...prev]);
    logAudit(`Created activity "${payload.name}"`);
    return activity;
  }, [logAudit]);

  const bookActivity = useCallback(async ({ activityId, guests }) => {
    if (authSession?.user?.id && guest.id !== GUEST.id) {
      try {
        const booking = await bookRemoteActivity(activityId, guests);
        setActivityBookings((prev) => [booking, ...prev]);
        return { ok: true, booking };
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
  const createEvent = useCallback((payload) => {
    const event = { id: nextId('e'), status: 'DRAFT', icon: 'culture', ...payload };
    setEvents((prev) => [event, ...prev]);
    logAudit(`Created event "${payload.title}"`);
    return event;
  }, [logAudit]);

  const publishEvent = useCallback((eventId) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'PUBLISHED' } : e)));
    logAudit(`Published event #${eventId} — now visible to guests`);
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Promotions — Management CMS, published to Guest App.
  // ---------------------------------------------------------------------
  const createPromotion = useCallback((payload) => {
    const promo = { id: nextId('p'), status: 'DRAFT', impressions: 0, clicks: 0, bookings: 0, redemptions: 0, revenue: 0, ...payload };
    setPromotions((prev) => [promo, ...prev]);
    logAudit(`Created promotion "${payload.title}"`);
    return promo;
  }, [logAudit]);

  const publishPromotion = useCallback((promoId) => {
    setPromotions((prev) => prev.map((p) => (p.id === promoId ? { ...p, status: 'PUBLISHED' } : p)));
    logAudit(`Published promotion #${promoId} — now visible to guests`);
  }, [logAudit]);

  const archivePromotion = useCallback((promoId) => {
    setPromotions((prev) => prev.map((p) => (p.id === promoId ? { ...p, status: 'ARCHIVED' } : p)));
    logAudit(`Archived promotion #${promoId}`);
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Rooms / Housekeeping
  // ---------------------------------------------------------------------
  const updateRoomStatus = useCallback((roomId, status) => {
    setRooms((prev) => {
      const target = prev.find((r) => r.id === roomId);
      logAudit(`Updated room ${target?.number} status to ${status.replace(/_/g, ' ')}`);
      return prev.map((r) => (r.id === roomId ? { ...r, status } : r));
    });
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Maintenance
  // ---------------------------------------------------------------------
  const createMaintenanceIssue = useCallback((payload) => {
    const issue = { id: nextId('m'), status: 'OPEN', createdAt: new Date().toISOString(), resolvedAt: null, ...payload };
    setMaintenanceIssues((prev) => [issue, ...prev]);
    logAudit(`Logged maintenance issue in room ${payload.roomNumber}`);
    return issue;
  }, [logAudit]);

  const updateMaintenanceStatus = useCallback((issueId, status) => {
    setMaintenanceIssues((prev) => prev.map((m) => (m.id === issueId ? { ...m, status, resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : m.resolvedAt } : m)));
    logAudit(`Maintenance issue #${issueId} → ${status}`);
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Feedback — shared: guest submits, staff/management see & resolve.
  // ---------------------------------------------------------------------
  const submitFeedback = useCallback((data) => {
    const overall = data.ratings?.['Overall Experience'] || 0;
    const entry = {
      id: nextId('fb'),
      guestName: `${guest.firstName} ${guest.lastName}`,
      roomNumber: room.number,
      overall,
      ratings: data.ratings,
      comments: data.comments,
      createdAt: new Date().toISOString(),
      resolved: overall > (propertySettings.lowRatingThreshold || 3),
      resolutionNote: '',
    };
    setFeedback((prev) => [entry, ...prev]);
    if (overall <= (propertySettings.lowRatingThreshold || 3)) {
      setStaffNotifications((prev) => [{ id: nextId('sn'), title: 'Guest experience alert', body: `Room ${room.number} rated ${overall}/5`, category: 'Feedback', createdAt: new Date().toISOString(), read: false }, ...prev]);
    }
    return entry;
  }, [guest, room, propertySettings]);

  const resolveFeedback = useCallback((feedbackId, note) => {
    setFeedback((prev) => prev.map((f) => (f.id === feedbackId ? { ...f, resolved: true, resolutionNote: note } : f)));
    logAudit(`Resolved feedback #${feedbackId}`);
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Content CMS
  // ---------------------------------------------------------------------
  const setContentStatus = useCallback((contentId, status) => {
    setContentItems((prev) => prev.map((c) => (c.id === contentId ? { ...c, status, updatedAt: new Date().toISOString() } : c)));
    logAudit(`Content "#${contentId}" set to ${status}`);
  }, [logAudit]);

  // ---------------------------------------------------------------------
  // Notifications (guest + staff, kept separate since they're different audiences)
  // ---------------------------------------------------------------------
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);
  const markStaffNotificationRead = useCallback((id) => {
    setStaffNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllStaffNotificationsRead = useCallback(() => {
    setStaffNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const completeDigitalCheckIn = useCallback(() => {
    setCheckedIn(true);
    setReservation((r) => ({ ...r, status: 'checked_in' }));
  }, []);

  const unreadNotificationCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const unreadStaffNotificationCount = useMemo(() => staffNotifications.filter((n) => !n.read).length, [staffNotifications]);

  // ---------------------------------------------------------------------
  // Combined guest directory for Staff "Guests" screen (this app's own
  // signed-in guest + a handful of seeded "other guests in house").
  // ---------------------------------------------------------------------
  const allGuestsForStaff = useMemo(() => ([
    { id: guest.id, firstName: guest.firstName, lastName: guest.lastName, roomNumber: room.number, reservationNumber: reservation.reservationNumber, checkIn: reservation.checkIn, checkOut: reservation.checkOut, isAppUser: true },
    ...OTHER_GUESTS,
  ]), [guest, room, reservation]);

  const value = useMemo(
    () => ({
      hasOnboarded, completeOnboarding,
      experience, chooseExperience, exitToExperiencePicker,
      isAuthenticated, authSession, authLoading, dataLoading, dataError, refreshGuestData, signIn, signUp, sendMagicLink, signOut,
      updateGuest,
      opsSession, opsSignIn, opsSignOut, canAccessSurface,
      guest, setGuest, reservation, room,
      itinerary, addToItinerary, removeFromItinerary,
      serviceRequests, submitServiceRequest, assignRequestToStaff, updateRequestStatus, addRequestNote,
      savedActivityIds, toggleSavedActivity,
      notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationCount,
      submitFeedback, feedback, resolveFeedback,
      checkedIn, completeDigitalCheckIn,
      activities, createActivity, activityBookings, bookActivity,
      events, createEvent, publishEvent,
      promotions, createPromotion, publishPromotion, archivePromotion,
      rooms, updateRoomStatus,
      maintenanceIssues, createMaintenanceIssue, updateMaintenanceStatus,
      contentItems, setContentStatus,
      auditLog,
      staffNotifications, markStaffNotificationRead, markAllStaffNotificationsRead, unreadStaffNotificationCount,
      staffDirectory: STAFF_DIRECTORY,
      allGuestsForStaff,
      propertySettings, setPropertySettings,
    }),
    [
      hasOnboarded, completeOnboarding, experience, chooseExperience, exitToExperiencePicker,
      isAuthenticated, authSession, authLoading, dataLoading, dataError, refreshGuestData, signIn, signUp, sendMagicLink, signOut, updateGuest, opsSession, opsSignIn, opsSignOut, canAccessSurface,
      guest, reservation, room, itinerary, addToItinerary, removeFromItinerary,
      serviceRequests, submitServiceRequest, assignRequestToStaff, updateRequestStatus, addRequestNote,
      savedActivityIds, toggleSavedActivity, notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationCount,
      submitFeedback, feedback, resolveFeedback, checkedIn, completeDigitalCheckIn,
      activities, createActivity, activityBookings, bookActivity, events, createEvent, publishEvent,
      promotions, createPromotion, publishPromotion, archivePromotion, rooms, updateRoomStatus,
      maintenanceIssues, createMaintenanceIssue, updateMaintenanceStatus, contentItems, setContentStatus,
      auditLog, staffNotifications, markStaffNotificationRead, markAllStaffNotificationsRead, unreadStaffNotificationCount,
      allGuestsForStaff, propertySettings,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
