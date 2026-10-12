import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL || '/api') : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Native collection responses may be a legacy array or an explicit data envelope.
// Unknown/error objects must surface as a load failure rather than an empty table.
export function nativeRecordRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  throw new Error('The records response is incomplete. Try again.');
}
async function getRecordList(path) {
  const response = await api.get(path);
  return { ...response, data: nativeRecordRows(response.data) };
}

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });

// Donors
export const getDonors = () => getRecordList('/donors');
export const getDonor = (id) => api.get(`/donors/${id}`);
export const createDonor = (data) => api.post('/donors', data);
export const updateDonor = (id, data) => api.put(`/donors/${id}`, data);
export const deleteDonor = (id) => api.delete(`/donors/${id}`);

// Donations
export const getDonations = () => getRecordList('/donations');
export const getDonation = (id) => api.get(`/donations/${id}`);
export const createDonation = (data) => api.post('/donations', data);
export const updateDonation = (id, data) => api.put(`/donations/${id}`, data);
export const deleteDonation = (id) => api.delete(`/donations/${id}`);

// Screening
export const getScreenings = () => getRecordList('/screening');
export const getScreening = (id) => api.get(`/screening/${id}`);
export const createScreening = (data) => api.post('/screening', data);
export const updateScreening = (id, data) => api.put(`/screening/${id}`, data);
export const deleteScreening = (id) => api.delete(`/screening/${id}`);

// Deferrals
export const getDeferrals = () => getRecordList('/deferrals');
export const getDeferral = (id) => api.get(`/deferrals/${id}`);
export const createDeferral = (data) => api.post('/deferrals', data);
export const updateDeferral = (id, data) => api.put(`/deferrals/${id}`, data);
export const deleteDeferral = (id) => api.delete(`/deferrals/${id}`);

// Collections
export const getCollections = () => getRecordList('/collections');
export const getCollection = (id) => api.get(`/collections/${id}`);
export const createCollection = (data) => api.post('/collections', data);
export const updateCollection = (id, data) => api.put(`/collections/${id}`, data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);

// Blood Typing
export const getBloodTypings = () => getRecordList('/bloodtyping');
export const getBloodTyping = (id) => api.get(`/bloodtyping/${id}`);
export const createBloodTyping = (data) => api.post('/bloodtyping', data);
export const updateBloodTyping = (id, data) => api.put(`/bloodtyping/${id}`, data);
export const deleteBloodTyping = (id) => api.delete(`/bloodtyping/${id}`);

// Components
export const getComponents = () => getRecordList('/components');
export const getComponent = (id) => api.get(`/components/${id}`);
export const createComponent = (data) => api.post('/components', data);
export const updateComponent = (id, data) => api.put(`/components/${id}`, data);
export const deleteComponent = (id) => api.delete(`/components/${id}`);

// Inventory
export const getInventory = () => getRecordList('/inventory');
export const getInventoryItem = (id) => api.get(`/inventory/${id}`);
export const createInventoryItem = (data) => api.post('/inventory', data);
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`);

// Orders
export const getOrders = () => getRecordList('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Transportation
export const getTransportations = () => getRecordList('/transportation');
export const getTransportation = (id) => api.get(`/transportation/${id}`);
export const createTransportation = (data) => api.post('/transportation', data);
export const updateTransportation = (id, data) => api.put(`/transportation/${id}`, data);
export const deleteTransportation = (id) => api.delete(`/transportation/${id}`);

// Reactions
export const getReactions = () => getRecordList('/reactions');
export const getReaction = (id) => api.get(`/reactions/${id}`);
export const createReaction = (data) => api.post('/reactions', data);
export const updateReaction = (id, data) => api.put(`/reactions/${id}`, data);
export const deleteReaction = (id) => api.delete(`/reactions/${id}`);

// Equipment
export const getEquipment = () => getRecordList('/equipment');
export const getEquipmentItem = (id) => api.get(`/equipment/${id}`);
export const createEquipmentItem = (data) => api.post('/equipment', data);
export const updateEquipmentItem = (id, data) => api.put(`/equipment/${id}`, data);
export const deleteEquipmentItem = (id) => api.delete(`/equipment/${id}`);

// Staff
export const getStaff = () => getRecordList('/staff');
export const getStaffMember = (id) => api.get(`/staff/${id}`);
export const createStaffMember = (data) => api.post('/staff', data);
export const updateStaffMember = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaffMember = (id) => api.delete(`/staff/${id}`);

// Drives
export const getDrives = () => getRecordList('/drives');
export const getDrive = (id) => api.get(`/drives/${id}`);
export const createDrive = (data) => api.post('/drives', data);
export const updateDrive = (id, data) => api.put(`/drives/${id}`, data);
export const deleteDrive = (id) => api.delete(`/drives/${id}`);

// Rewards
export const getRewards = () => getRecordList('/rewards');
export const getReward = (id) => api.get(`/rewards/${id}`);
export const createReward = (data) => api.post('/rewards', data);
export const updateReward = (id, data) => api.put(`/rewards/${id}`, data);
export const deleteReward = (id) => api.delete(`/rewards/${id}`);

// AI Features. Adapt the page models to the native backend contracts so preset
// examples and manually entered values are both sent to the provider.
export const checkEligibility = (questionnaire, nativeRequestOptions = {}) =>
  api.post('/ai/eligibility', { questionnaire }, nativeRequestOptions);
export const predictExpiration = (data, nativeRequestOptions = {}) =>
  api.post('/ai/expiration-prediction', data, nativeRequestOptions);
export const generateCampaign = (data, nativeRequestOptions = {}) =>
  api.post('/ai/campaign-content', {
    ...data,
    urgency: data.urgency_level
  }, nativeRequestOptions);
export const generateReengagement = (data, nativeRequestOptions = {}) =>
  api.post('/ai/deferral-reengagement', {
    deferral_reason: data.deferral_reason || data.reason,
    deferral_date: data.deferral_date || data.created_at,
    donor_info: data.donor_info || data,
    outreach_channel: data.outreach_channel,
    tone: data.tone,
    additional_context: data.additional_context
  }, nativeRequestOptions);
export const forecastDemand = (data, nativeRequestOptions = {}) =>
  api.post('/ai/demand-forecast', {
    historical_data: data.orders,
    current_inventory: data.inventory,
    forecast_days: data.forecast_days,
    service_level_target: data.service_level_target,
    additional_context: data.additional_context
  }, nativeRequestOptions);

export default api;
