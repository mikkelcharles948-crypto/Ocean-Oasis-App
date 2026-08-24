import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
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
} from '../services/supabaseStaffData';

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
  const [opsSession, setOpsSession] = useState(null); // { id, name, role, department }

  const [guest, setGuest] = useState(GUEST);
  const [reservation, setReservation] = useState(RESERVATION);

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
        await refreshStaffData();
      } else {
        setOpsSession(null);
        await refreshGuestData();
      }
    }
    resolveSession();
    return () => {
      mounted = false;
    };
  }, [authSession?.user?.id, refreshGuestData, refreshStaffData]);

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
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [opsSession]);

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
        return null;
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

  const completeDigitalCheckIn = useCallback(() => {
    setCheckedIn(true);
    setReservation((r) => ({ ...r, status: 'checked_in' }));
  }, []);

  const unreadNotificationCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const unreadStaffNotificationCount = useMemo(() => staffNotifications.filter((n) => !n.read).length, [staffNotifications]);

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
      staffDirectory,
      allGuestsForStaff,
      refreshStaffData,
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
      staffDirectory, allGuestsForStaff, refreshStaffData, propertySettings,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
