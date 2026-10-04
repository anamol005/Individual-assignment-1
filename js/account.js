import {state, setToken} from './state.js';
import {t} from './i18n.js';
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
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%232e7d6b"/><circle cx="32" cy="26" r="12" fill="%23dcece6"/><rect x="14" y="42" width="36" height="20" rx="10" fill="%23dcece6"/></svg>'
  );

let authMode = 'login';

function resolveAvatar(avatar) {
  if (!avatar) {
    return DEFAULT_AVATAR;
  }

  if (/^https?:\/\//i.test(avatar)) {
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
        setTimeout(() => {
          selectRestaurant(user.favouriteRestaurant);
        }, 300);
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

  $('auth-title').textContent = t(
    isRegister ? 'auth.registerTitle' : 'auth.loginTitle'
  );

  $('auth-submit').textContent = t(
    isRegister ? 'auth.registerSubmit' : 'auth.loginSubmit'
  );

  $('auth-switch-text').textContent = t(
    isRegister ? 'auth.haveAccount' : 'auth.needAccount'
  );

  $('auth-switch-btn').textContent = t(
    isRegister ? 'auth.switchToLogin' : 'auth.switchToRegister'
  );

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
    setAuthMessage(t('auth.required'), 'error');
    return;
  }

  submit.disabled = true;
  submit.textContent = t('auth.working');

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
          (response && response.message) || t('auth.loginFailed'),
          'error'
        );

        return;
      }

      setToken(response.token);
      state.user = response.data;

      updateAccountUI();

      $('auth-dialog').close();

      if (response.data.favouriteRestaurant) {
        selectRestaurant(response.data.favouriteRestaurant);
      }
    } else {
      const response = await register(username, email, password);

      if (response && response.activationUrl) {
        setAuthMessage(
          t('auth.activation') + ' ' + response.activationUrl,
          'ok'
        );
      } else {
        setAuthMessage(t('auth.registerSuccess'), 'ok');
      }

      authMode = 'login';

      $('auth-email-field').classList.add('hidden');
      $('auth-email').required = false;

      $('auth-title').textContent = t('auth.loginTitle');
      $('auth-submit').textContent = t('auth.loginSubmit');
      $('auth-switch-text').textContent = t('auth.needAccount');
      $('auth-switch-btn').textContent = t('auth.switchToRegister');
    }
  } catch (error) {
    const textKey =
      authMode === 'login' ? 'auth.loginFailed' : 'auth.registerFailed';

    let message = t(textKey);

    if (error instanceof ApiError && error.network) {
      message = t('conn.offline');
    } else if (error.message && error.message !== 'network') {
      message = error.message;
    }

    setAuthMessage(message, 'error');
  } finally {
    submit.disabled = false;

    if (authMode === 'register') {
      submit.textContent = t('auth.registerSubmit');
    } else {
      submit.textContent = t('auth.loginSubmit');
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
  setAuthMessage(t('auth.sessionExpired'), 'error');
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
    setMessage('profile-message', t('profile.saved'), 'ok');
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

    if (fields.username) {
      state.user.username = fields.username;
    }

    if (fields.email) {
      state.user.email = fields.email;
    }

    updateAccountUI();

    setMessage('profile-message', t('profile.saved'), 'ok');

    $('profile-password').value = '';
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      handleExpiredSession();
      return;
    }

    setMessage(
      'profile-message',
      error.message || t('profile.saveFailed'),
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
    setMessage('avatar-message', t('profile.avatarChoose'), 'error');
    return;
  }

  const button = $('avatar-upload-btn');

  button.disabled = true;

  const original = button.textContent;

  button.textContent = t('profile.uploading');

  try {
    const response = await uploadAvatar(file, state.token);
    const avatar = response && response.data && response.data.avatar;

    if (avatar) {
      state.user.avatar = avatar;

      $('profile-avatar').src = resolveAvatar(avatar);

      updateAccountUI();

      setMessage('avatar-message', t('profile.avatarUploaded'), 'ok');
    } else {
      setMessage('avatar-message', t('profile.avatarFailed'), 'error');
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      handleExpiredSession();
      return;
    }

    setMessage(
      'avatar-message',
      error.message || t('profile.avatarFailed'),
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
