/* ============================================
   Rains Blog — API Client
   Unified fetch wrapper for all API calls
   ============================================ */
const API_BASE = '/api';

// Get auth token from localStorage
function getToken() {
    return localStorage.getItem('rains_token');
}

// Set auth token
function setToken(token) {
    if (token) localStorage.setItem('rains_token', token);
    else localStorage.removeItem('rains_token');
}

// Generic fetch wrapper
async function apiFetch(endpoint, options = {}) {
    const headers = { ...options.headers };
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(API_BASE + endpoint, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'API request failed: ' + response.status);
    }
    return data;
}

// Public API
const PublicAPI = {
    // Posts
    getPosts: (category = '', page = 1) => apiFetch('/posts?category=' + encodeURIComponent(category) + '&page=' + page),
    getPost: (slug) => apiFetch('/posts/' + slug),
    getAdjacent: (slug) => apiFetch('/posts/' + slug + '/adjacent'),
    getArchive: () => apiFetch('/posts/archive'),
    // Projects
    getProjects: () => apiFetch('/projects'),
    // Friends
    getFriends: () => apiFetch('/friends'),
    // Recommendations
    getRecommendations: (type) => apiFetch('/recommendations' + (type ? '?type=' + type : '')),
    // Messages（观众席留言）
    getMessages: () => apiFetch('/messages'),
    postMessage: (data) => apiFetch('/messages', { method: 'POST', body: JSON.stringify(data) }),
};

// Auth API
const AuthAPI = {
    login: (username, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
    me: () => apiFetch('/auth/me'),
};

// Admin API
const AdminAPI = {
    // Posts
    getPosts: () => apiFetch('/admin/posts'),
    getPost: (id) => apiFetch('/admin/posts/' + id),
    createPost: (data) => apiFetch('/admin/posts', { method: 'POST', body: JSON.stringify(data) }),
    updatePost: (id, data) => apiFetch('/admin/posts/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    deletePost: (id) => apiFetch('/admin/posts/' + id, { method: 'DELETE' }),
    // Projects
    getProjects: () => apiFetch('/admin/projects'),
    createProject: (data) => apiFetch('/admin/projects', { method: 'POST', body: JSON.stringify(data) }),
    updateProject: (id, data) => apiFetch('/admin/projects/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProject: (id) => apiFetch('/admin/projects/' + id, { method: 'DELETE' }),
    // Friends
    getFriends: () => apiFetch('/admin/friends'),
    createFriend: (data) => apiFetch('/admin/friends', { method: 'POST', body: JSON.stringify(data) }),
    updateFriend: (id, data) => apiFetch('/admin/friends/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    deleteFriend: (id) => apiFetch('/admin/friends/' + id, { method: 'DELETE' }),
    // Recommendations
    getRecommendations: () => apiFetch('/admin/recommendations'),
    createRecommendation: (data) => apiFetch('/admin/recommendations', { method: 'POST', body: JSON.stringify(data) }),
    updateRecommendation: (id, data) => apiFetch('/admin/recommendations/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    deleteRecommendation: (id) => apiFetch('/admin/recommendations/' + id, { method: 'DELETE' }),
    // Messages（留言审核）
    getMessages: (status) => apiFetch('/admin/messages' + (status ? '?status=' + status : '')),
    approveMessage: (id) => apiFetch('/admin/messages/' + id + '/approve', { method: 'PUT' }),
    rejectMessage: (id) => apiFetch('/admin/messages/' + id + '/reject', { method: 'PUT' }),
    deleteMessage: (id) => apiFetch('/admin/messages/' + id, { method: 'DELETE' }),
    // Upload
    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiFetch('/admin/upload', { method: 'POST', body: formData });
    },
    getFiles: () => apiFetch('/admin/upload/list'),
    deleteFile: (filename) => apiFetch('/admin/upload/' + filename, { method: 'DELETE' }),
};

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/admin/login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
    }
    return true;
}