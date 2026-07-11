const API_BASE_URL = 'http://localhost:5001/api';

export const fetchDashboardStats = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard-stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

export const fetchCustomers = async () => {
  const res = await fetch(`${API_BASE_URL}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
};

export const createCustomer = async (customerData) => {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to create customer (Status: ${res.status})`);
  }
  return res.json();
};

export const updateCustomer = async (id, customerData) => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to update customer (Status: ${res.status})`);
  }
  return res.json();
};

export const deleteCustomer = async (id) => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to delete customer (Status: ${res.status})`);
  }
  return res.json();
};

export const sendCustomerEmail = async (customerIds, message) => {
  const res = await fetch(`${API_BASE_URL}/settings/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerIds, message })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to send email (Status: ${res.status})`);
  }
  return res.json();
};

export const fetchFlights = async () => {
  const res = await fetch(`${API_BASE_URL}/flights`);
  if (!res.ok) throw new Error('Failed to fetch flights');
  return res.json();
};

export const createFlight = async (flightData) => {
  const res = await fetch(`${API_BASE_URL}/flights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flightData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to create flight (Status: ${res.status})`);
  }
  return res.json();
};

export const updateFlight = async (id, flightData) => {
  const res = await fetch(`${API_BASE_URL}/flights/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flightData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to update flight (Status: ${res.status})`);
  }
  return res.json();
};

export const deleteFlight = async (id) => {
  const res = await fetch(`${API_BASE_URL}/flights/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to delete flight (Status: ${res.status})`);
  }
  return res.json();
};

export const fetchTickets = async () => {
  const res = await fetch(`${API_BASE_URL}/tickets`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
};

export const createTicket = async (ticketData) => {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
};

export const updateTicket = async (id, ticketData) => {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json();
};

export const deleteTicket = async (id) => {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete ticket');
  return res.json();
};

export const fetchVisaTypes = async () => {
  const res = await fetch(`${API_BASE_URL}/visa-types`);
  if (!res.ok) throw new Error('Failed to fetch visa types');
  return res.json();
};

export const createVisaType = async (data) => {
  const res = await fetch(`${API_BASE_URL}/visa-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create visa type');
  return res.json();
};

export const updateVisaType = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/visa-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update visa type');
  return res.json();
};

export const deleteVisaType = async (id) => {
  const res = await fetch(`${API_BASE_URL}/visa-types/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete visa type');
  return res.json();
};

export const fetchVisaApplications = async () => {
  const res = await fetch(`${API_BASE_URL}/visa-applications`);
  if (!res.ok) throw new Error('Failed to fetch visa applications');
  return res.json();
};

export const createVisaApplication = async (data) => {
  const res = await fetch(`${API_BASE_URL}/visa-applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create visa application');
  return res.json();
};

export const updateVisaApplication = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/visa-applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update visa application');
  return res.json();
};

export const deleteVisaApplication = async (id) => {
  const res = await fetch(`${API_BASE_URL}/visa-applications/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete visa application');
  return res.json();
};

export const fetchTourPackages = async () => {
  const res = await fetch(`${API_BASE_URL}/tour-packages`);
  if (!res.ok) throw new Error('Failed to fetch tour packages');
  return res.json();
};

export const createTourPackage = async (data) => {
  const res = await fetch(`${API_BASE_URL}/tour-packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create tour package');
  return res.json();
};

export const updateTourPackage = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/tour-packages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update tour package');
  return res.json();
};

export const deleteTourPackage = async (id) => {
  const res = await fetch(`${API_BASE_URL}/tour-packages/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete tour package');
  return res.json();
};

export const fetchTourBookings = async () => {
  const res = await fetch(`${API_BASE_URL}/tour-bookings`);
  if (!res.ok) throw new Error('Failed to fetch tour bookings');
  return res.json();
};

export const createTourBooking = async (data) => {
  const res = await fetch(`${API_BASE_URL}/tour-bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create tour booking');
  return res.json();
};

export const updateTourBooking = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/tour-bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update tour booking');
  return res.json();
};

export const deleteTourBooking = async (id) => {
  const res = await fetch(`${API_BASE_URL}/tour-bookings/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete tour booking');
  return res.json();
};

export const fetchCargo = async () => {
  const res = await fetch(`${API_BASE_URL}/cargo`);
  if (!res.ok) throw new Error('Failed to fetch cargo');
  return res.json();
};

export const createCargo = async (data) => {
  const res = await fetch(`${API_BASE_URL}/cargo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create cargo');
  return res.json();
};

export const updateCargo = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/cargo/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update cargo');
  return res.json();
};

export const deleteCargo = async (id) => {
  const res = await fetch(`${API_BASE_URL}/cargo/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete cargo');
  return res.json();
};

export const fetchInvoices = async () => {
  const res = await fetch(`${API_BASE_URL}/invoices`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
};

export const createInvoice = async (data) => {
  const res = await fetch(`${API_BASE_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
};

export const updateInvoice = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update invoice');
  return res.json();
};

export const deleteInvoice = async (id) => {
  const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete invoice');
  return res.json();
};

export const fetchPayments = async () => {
  const res = await fetch(`${API_BASE_URL}/payments`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
};

export const createPayment = async (data) => {
  const res = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
};

export const updatePayment = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update payment');
  return res.json();
};

export const deletePayment = async (id) => {
  const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete payment');
  return res.json();
};

// Expenses
export const fetchExpenses = async () => {
  const res = await fetch(`${API_BASE_URL}/expenses`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch expenses (Status: ${res.status})`);
  }
  return res.json();
};

export const createExpense = async (data) => {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to create expense (Status: ${res.status})`);
  }
  return res.json();
};

export const updateExpense = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to update expense (Status: ${res.status})`);
  }
  return res.json();
};

export const deleteExpense = async (id) => {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to delete expense (Status: ${res.status})`);
  }
  return res.json();
};


// --- Roles API ---
export const fetchRoles = async () => {
  const res = await fetch(`${API_BASE_URL}/roles`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch roles (Status: ${res.status})`);
  }
  return res.json();
};

export const createRole = async (data) => {
  const res = await fetch(`${API_BASE_URL}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to create role (Status: ${res.status})`);
  }
  return res.json();
};

export const updateRole = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to update role (Status: ${res.status})`);
  }
  return res.json();
};

export const deleteRole = async (id) => {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to delete role (Status: ${res.status})`);
  }
  return res.json();
};

// --- Users API ---
export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/users`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch users (Status: ${res.status})`);
  }
  return res.json();
};

export const createUser = async (data) => {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to create user (Status: ${res.status})`);
  }
  return res.json();
};

export const updateUser = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to update user (Status: ${res.status})`);
  }
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to delete user (Status: ${res.status})`);
  }
  return res.json();
};

// --- Advanced Reports API ---
const buildQueryParams = (params) => {
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key]) query.append(key, params[key]);
  }
  return query.toString();
};

export const fetchAdvancedDashboardStats = async (filters = {}) => {
  const res = await fetch(`${API_BASE_URL}/reports/dashboard?${buildQueryParams(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
};

export const fetchDashboardCharts = async () => {
  const res = await fetch(`${API_BASE_URL}/reports/charts`);
  if (!res.ok) throw new Error('Failed to fetch dashboard charts');
  return res.json();
};

export const fetchReportRevenue = async (filters = {}) => {
  const res = await fetch(`${API_BASE_URL}/reports/revenue?${buildQueryParams(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch revenue report');
  return res.json();
};

export const fetchReportInvoices = async (filters = {}) => {
  const res = await fetch(`${API_BASE_URL}/reports/invoices?${buildQueryParams(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch invoices report');
  return res.json();
};

export const fetchReportPayments = async (filters = {}) => {
  const res = await fetch(`${API_BASE_URL}/reports/payments?${buildQueryParams(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch payments report');
  return res.json();
};

export const fetchReportBookings = async (filters = {}) => {
  const res = await fetch(`${API_BASE_URL}/reports/bookings?${buildQueryParams(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch bookings report');
  return res.json();
};

export const fetchReportVisas = async (filters = {}) => {
  const res = await fetch(`${API_BASE_URL}/reports/visa?${buildQueryParams(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch visa report');
  return res.json();
};

export const fetchReportExpenses = async (filters = {}) => {
  const res = await fetch(`${API_BASE_URL}/reports/expenses?${buildQueryParams(filters)}`);
  if (!res.ok) throw new Error('Failed to fetch expenses report');
  return res.json();
};
