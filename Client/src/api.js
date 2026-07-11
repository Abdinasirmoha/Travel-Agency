const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      throw new Error(
        res.status === 404
          ? 'Login service unavailable. Make sure the backend server is running and restarted.'
          : 'Server returned an unexpected response. Check that the backend is running on port 5001.'
      );
    }
    throw new Error('Invalid response from server.');
  }
}

// ── Auth (customer session stored in localStorage) ──
export const clientLogin = async (email, passportNo) => {
  const res = await fetch(`${API}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), passportNo: passportNo.trim() }),
  });
  const json = await parseJsonResponse(res);
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json;
};

export const clientRegister = async (data) => {
  const res = await fetch(`${API}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await parseJsonResponse(res);
  if (!res.ok) throw new Error(json.message || 'Registration failed');
  return json;
};

// ── Flights ──
export const getFlights = async () => {
  const res = await fetch(`${API}/flights`);
  if (!res.ok) throw new Error('Failed to load flights');
  return res.json();
};

// ── Tickets ──
export const bookTicket = async (data) => {
  const res = await fetch(`${API}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, isOnline: true }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Booking failed');
  return json;
};

// ── Visa Types ──
export const getVisaTypes = async () => {
  const res = await fetch(`${API}/visa-types`);
  if (!res.ok) throw new Error('Failed to load visa types');
  return res.json();
};

// ── Visa Applications ──
export const applyVisa = async (data) => {
  const res = await fetch(`${API}/visa-applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, isOnline: true }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Application failed');
  return json;
};

// ── Tour Packages ──
export const getTourPackages = async () => {
  const res = await fetch(`${API}/tour-packages`);
  if (!res.ok) throw new Error('Failed to load tour packages');
  return res.json();
};

// ── Tour Bookings ──
export const bookTour = async (data) => {
  const res = await fetch(`${API}/tour-bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, isOnline: true }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Booking failed');
  return json;
};
