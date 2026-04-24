import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
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

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });

// Donors
export const getDonors = () => api.get('/donors');
export const getDonor = (id) => api.get(`/donors/${id}`);
export const createDonor = (data) => api.post('/donors', data);
export const updateDonor = (id, data) => api.put(`/donors/${id}`, data);
export const deleteDonor = (id) => api.delete(`/donors/${id}`);

// Donations
export const getDonations = () => api.get('/donations');
export const getDonation = (id) => api.get(`/donations/${id}`);
export const createDonation = (data) => api.post('/donations', data);
export const updateDonation = (id, data) => api.put(`/donations/${id}`, data);
export const deleteDonation = (id) => api.delete(`/donations/${id}`);

// Screening
export const getScreenings = () => api.get('/screening');
export const getScreening = (id) => api.get(`/screening/${id}`);
export const createScreening = (data) => api.post('/screening', data);
export const updateScreening = (id, data) => api.put(`/screening/${id}`, data);
export const deleteScreening = (id) => api.delete(`/screening/${id}`);

// Deferrals
export const getDeferrals = () => api.get('/deferrals');
export const getDeferral = (id) => api.get(`/deferrals/${id}`);
export const createDeferral = (data) => api.post('/deferrals', data);
export const updateDeferral = (id, data) => api.put(`/deferrals/${id}`, data);
export const deleteDeferral = (id) => api.delete(`/deferrals/${id}`);

// Collections
export const getCollections = () => api.get('/collections');
export const getCollection = (id) => api.get(`/collections/${id}`);
export const createCollection = (data) => api.post('/collections', data);
export const updateCollection = (id, data) => api.put(`/collections/${id}`, data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);

// Blood Typing
export const getBloodTypings = () => api.get('/bloodtyping');
export const getBloodTyping = (id) => api.get(`/bloodtyping/${id}`);
export const createBloodTyping = (data) => api.post('/bloodtyping', data);
export const updateBloodTyping = (id, data) => api.put(`/bloodtyping/${id}`, data);
export const deleteBloodTyping = (id) => api.delete(`/bloodtyping/${id}`);

// Components
export const getComponents = () => api.get('/components');
export const getComponent = (id) => api.get(`/components/${id}`);
export const createComponent = (data) => api.post('/components', data);
export const updateComponent = (id, data) => api.put(`/components/${id}`, data);
export const deleteComponent = (id) => api.delete(`/components/${id}`);

// Inventory
export const getInventory = () => api.get('/inventory');
export const getInventoryItem = (id) => api.get(`/inventory/${id}`);
export const createInventoryItem = (data) => api.post('/inventory', data);
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`);

// Orders
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Transportation
export const getTransportations = () => api.get('/transportation');
export const getTransportation = (id) => api.get(`/transportation/${id}`);
export const createTransportation = (data) => api.post('/transportation', data);
export const updateTransportation = (id, data) => api.put(`/transportation/${id}`, data);
export const deleteTransportation = (id) => api.delete(`/transportation/${id}`);

// Reactions
export const getReactions = () => api.get('/reactions');
export const getReaction = (id) => api.get(`/reactions/${id}`);
export const createReaction = (data) => api.post('/reactions', data);
export const updateReaction = (id, data) => api.put(`/reactions/${id}`, data);
export const deleteReaction = (id) => api.delete(`/reactions/${id}`);

// Equipment
export const getEquipment = () => api.get('/equipment');
export const getEquipmentItem = (id) => api.get(`/equipment/${id}`);
export const createEquipmentItem = (data) => api.post('/equipment', data);
export const updateEquipmentItem = (id, data) => api.put(`/equipment/${id}`, data);
export const deleteEquipmentItem = (id) => api.delete(`/equipment/${id}`);

// Staff
export const getStaff = () => api.get('/staff');
export const getStaffMember = (id) => api.get(`/staff/${id}`);
export const createStaffMember = (data) => api.post('/staff', data);
export const updateStaffMember = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaffMember = (id) => api.delete(`/staff/${id}`);

// Drives
export const getDrives = () => api.get('/drives');
export const getDrive = (id) => api.get(`/drives/${id}`);
export const createDrive = (data) => api.post('/drives', data);
export const updateDrive = (id, data) => api.put(`/drives/${id}`, data);
export const deleteDrive = (id) => api.delete(`/drives/${id}`);

// Rewards
export const getRewards = () => api.get('/rewards');
export const getReward = (id) => api.get(`/rewards/${id}`);
export const createReward = (data) => api.post('/rewards', data);
export const updateReward = (id, data) => api.put(`/rewards/${id}`, data);
export const deleteReward = (id) => api.delete(`/rewards/${id}`);

// AI Features
export const checkEligibility = (data) => api.post('/ai/eligibility', data);
export const predictExpiration = (data) => api.post('/ai/expiration', data);
export const generateCampaign = (data) => api.post('/ai/campaign', data);
export const generateReengagement = (data) => api.post('/ai/reengagement', data);
export const forecastDemand = (data) => api.post('/ai/forecast', data);

export default api;
