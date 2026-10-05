import {state, setToken} from './state.js';
import {UPLOADS_BASE} from './config.js';

import {
  login,
  register,
  validateToken,
  updateUser,
  uploadAvatar,
  ApiError,
} from './api.js';

import {
  renderList,
  refreshSelectedDetail,
  selectRestaurant,
} from './restaurants.js';

const $ = (id) => document.getElementById(id);

const DEFAULT_AVATAR =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

let authMode = 'login';

function resolveAvatar(avatar) {
  if (!avatar) {
    return DEFAULT_AVATAR;
  }

  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }

  return UPLOADS_BASE + avatar;
}

export function updateAccountUI() {
  const loggedIn = !!state.user;

  $('account-logged-in').classList.toggle('hidden', !loggedIn);
  $('account-logged-out').classList.toggle('hidden', loggedIn);

  if (loggedIn) {
    $('user-name').textContent = state.user.username || '';
    $('user-avatar').src = resolveAvatar(state.user.avatar);
    $('user-avatar').alt = state.user.username || '';
  }

  refreshSelectedDetail();
  renderList();
}

export async function restoreSession() {
  if (!state.token) {
    return;
  }

  try {
    const user = await validateToken(state.token);

    if (user && user.username) {
      state.user = user;

      updateAccountUI();

      if (user.favouriteRestaurant) {
        selectRestaurant(user.favouriteRestaurant);
      }
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      setToken(null);
      state.user = null;
      updateAccountUI();
    }
  }
}

export function openAuth(mode) {
  authMode = mode;

  const isRegister = mode === 'register';

  $('auth-email-field').classList.toggle('hidden', !isRegister);

  $('auth-email').required = isRegister;

  if (isRegister) {
    $('auth-title').textContent = 'Create an account';
    $('auth-submit').textContent = 'Register';
    $('auth-switch-text').textContent = 'Already have an account?';
    $('auth-switch-btn').textContent = 'Log in';
  } else {
    $('auth-title').textContent = 'Log in';
    $('auth-submit').textContent = 'Log in';
    $('auth-switch-text').textContent = "Don't have an account?";
    $('auth-switch-btn').textContent = 'Register';
  }

  setAuthMessage('', '');

  $('auth-form').reset();
  $('auth-dialog').showModal();
  $('auth-username').focus();
}

export function toggleAuthMode() {
  if (authMode === 'login') {
    openAuth('register');
  } else {
    openAuth('login');
  }
}

function setAuthMessage(text, kind) {
  const element = $('auth-message');

  element.textContent = text;
  element.className = 'form-message' + (kind ? ' ' + kind : '');
}

export async function handleAuthSubmit(event) {
  event.preventDefault();

  const username = $('auth-username').value.trim();

  const password = $('auth-password').value;

  const email = $('auth-email').value.trim();

  const submit = $('auth-submit');

  if (!username || !password || (authMode === 'register' && !email)) {
    setAuthMessage('Please fill in all required fields.', 'error');

    return;
  }

  submit.disabled = true;
  submit.textContent = 'Please wait...';

  try {
    if (authMode === 'login') {
      const response = await login(username, password);

      if (
        !response ||
        !response.token ||
        !response.data ||
        !response.data.username
      ) {
        setAuthMessage(
          (response && response.message) ||
            'Login failed. Check your username and password.',
          'error'
        );

        return;
      }

      setToken(response.token);
      state.user = response.data;

      updateAccountUI();

      $('auth-dialog').close();

      if (state.user.favouriteRestaurant) {
        selectRestaurant(state.user.favouriteRestaurant);
      }
    } else {
      const response = await register(username, email, password);

      if (response && response.activationUrl) {
        setAuthMessage(
          'Please activate your account using this link: ' +
            response.activationUrl,
          'ok'
        );
      } else {
        setAuthMessage('Account created. You can now log in.', 'ok');
      }

      authMode = 'login';

      $('auth-email-field').classList.add('hidden');

      $('auth-email').required = false;

      $('auth-title').textContent = 'Log in';
      $('auth-submit').textContent = 'Log in';
      $('auth-switch-text').textContent = "Don't have an account?";
      $('auth-switch-btn').textContent = 'Register';
    }
  } catch (error) {
    let message;

    if (authMode === 'login') {
      message = 'Login failed. Check your username and password.';
    } else {
      message = 'Registration failed.';
    }

    if (error instanceof ApiError && error.network) {
      message =
        'Cannot reach the Metropolia restaurant API. Connect to the Metropolia network or VPN.';
    } else if (error.message && error.message !== 'network') {
      message = error.message;
    }

    setAuthMessage(message, 'error');
  } finally {
    submit.disabled = false;

    if (authMode === 'register') {
      submit.textContent = 'Register';
    } else {
      submit.textContent = 'Log in';
    }
  }
}

export function logout() {
  setToken(null);
  state.user = null;

  updateAccountUI();
}

export function handleExpiredSession() {
  logout();

  openAuth('login');

  setAuthMessage('Your session expired. Please log in again.', 'error');
}

export function openProfile() {
  if (!state.user) {
    return;
  }

  $('profile-username').value = state.user.username || '';

  $('profile-email').value = state.user.email || '';

  $('profile-password').value = '';

  $('profile-avatar').src = resolveAvatar(state.user.avatar);

  setMessage('profile-message', '', '');

  setMessage('avatar-message', '', '');

  $('profile-dialog').showModal();
}

function setMessage(id, text, kind) {
  const element = $(id);

  element.textContent = text;
  element.className = 'form-message' + (kind ? ' ' + kind : '');
}

export async function handleProfileSubmit(event) {
  event.preventDefault();

  if (!state.user) {
    return;
  }

  const username = $('profile-username').value.trim();

  const email = $('profile-email').value.trim();

  const password = $('profile-password').value;

  const submit = $('profile-submit');

  const fields = {};

  if (username && username !== state.user.username) {
    fields.username = username;
  }

  if (email && email !== state.user.email) {
    fields.email = email;
  }

  if (password) {
    fields.password = password;
  }

  if (Object.keys(fields).length === 0) {
    setMessage('profile-message', 'Profile updated.', 'ok');

    return;
  }

  submit.disabled = true;

  try {
    const response = await updateUser(fields, state.token);

    const updated = (response && response.data) || {};

    state.user = {
      ...state.user,
      ...updated,
    };

    updateAccountUI();

    setMessage('profile-message', 'Profile updated.', 'ok');

    $('profile-password').value = '';
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      handleExpiredSession();
      return;
    }

    setMessage(
      'profile-message',
      error.message || 'Could not update profile.',
      'error'
    );
  } finally {
    submit.disabled = false;
  }
}

export async function handleAvatarUpload() {
  if (!state.user) {
    return;
  }

  const input = $('avatar-input');
  const file = input.files && input.files[0];

  if (!file) {
    setMessage('avatar-message', 'Please choose an image first.', 'error');

    return;
  }

  const button = $('avatar-upload-btn');

  const original = button.textContent;

  button.disabled = true;
  button.textContent = 'Uploading...';

  try {
    const response = await uploadAvatar(file, state.token);

    const avatar = response && response.data && response.data.avatar;

    if (avatar) {
      state.user.avatar = avatar;

      $('profile-avatar').src = resolveAvatar(avatar);

      updateAccountUI();

      setMessage('avatar-message', 'Profile picture updated.', 'ok');
    } else {
      setMessage('avatar-message', 'Could not upload picture.', 'error');
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      handleExpiredSession();
      return;
    }

    setMessage(
      'avatar-message',
      error.message || 'Could not upload picture.',
      'error'
    );
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

export async function toggleFavourite() {
  if (!state.user) {
    openAuth('login');
    return;
  }

  const id = state.selectedId;

  if (!id) {
    return;
  }

  const button = $('favourite-btn');

  button.disabled = true;

  try {
    await updateUser(
      {
        favouriteRestaurant: id,
      },
      state.token
    );

    state.user.favouriteRestaurant = id;

    refreshSelectedDetail();
    renderList();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      handleExpiredSession();
      return;
    }

    button.disabled = false;
  }
}
