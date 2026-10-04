import {API_BASE} from './config.js';

export class ApiError extends Error {
  constructor(message, network = false, status = 0) {
    super(message);
    this.network = network;
    this.status = status;
  }
}

async function request(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body;
  const token = options.token;
  const isForm = options.isForm || false;

  const headers = {};

  if (token) {
    headers.Authorization = 'Bearer ' + token;
  }

  let requestBody = body;

  if (body && !isForm) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(API_BASE + path, {
      method: method,
      headers: headers,
      body: requestBody,
    });
  } catch {
    throw new ApiError('network', true);
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = 'HTTP ' + response.status;

    if (data && data.message) {
      message = data.message;
    } else if (data && data.error) {
      message = data.error;
    }

    throw new ApiError(message, false, response.status);
  }

  return data;
}

export async function getRestaurants() {
  const data = await request('/restaurants');

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.restaurants)) {
    return data.restaurants;
  }

  return [];
}

export async function getRestaurant(id) {
  return request('/restaurants/' + id);
}

export async function getDailyMenu(id, lang) {
  const data = await request('/restaurants/daily/' + id + '/' + lang);

  if (data && Array.isArray(data.courses)) {
    return data.courses;
  }

  return [];
}

export async function getWeeklyMenu(id, lang) {
  const data = await request('/restaurants/weekly/' + id + '/' + lang);

  if (data && Array.isArray(data.days)) {
    return data.days;
  }

  return [];
}

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: {
      username: username,
      password: password,
    },
  });
}

export async function register(username, email, password) {
  return request('/users', {
    method: 'POST',
    body: {
      username: username,
      email: email,
      password: password,
    },
  });
}

export async function validateToken(token) {
  return request('/users/token', {
    token: token,
  });
}

export async function updateUser(fields, token) {
  return request('/users', {
    method: 'PUT',
    body: fields,
    token: token,
  });
}

export async function uploadAvatar(file, token) {
  const form = new FormData();

  form.append('avatar', file);

  return request('/users/avatar', {
    method: 'POST',
    body: form,
    token: token,
    isForm: true,
  });
}
