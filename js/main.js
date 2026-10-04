import {state, setLang} from './state.js';
import {applyStaticTranslations, t} from './i18n.js';

import {
  loadRestaurants,
  renderList,
  setFilter,
  clearFilters,
  setMenuMode,
  startFindNearest,
} from './restaurants.js';

import {loadMenu} from './menu.js';

import {
  restoreSession,
  updateAccountUI,
  openAuth,
  toggleAuthMode,
  handleAuthSubmit,
  logout,
  openProfile,
  handleProfileSubmit,
  handleAvatarUpload,
  toggleFavourite,
} from './account.js';

const $ = (id) => document.getElementById(id);

function showBanner(text, kind) {
  const banner = $('connection-banner');

  banner.className = 'banner ' + (kind || '');
  banner.textContent = text;
  banner.classList.remove('hidden');
}

function hideBanner() {
  $('connection-banner').classList.add('hidden');
}

function locationNotify(text, kind) {
  showBanner(text, kind);
  setTimeout(hideBanner, 5000);
}

function showOfflineBanner() {
  showBanner(t('conn.offline'), 'error');
}

function switchLanguage(lang) {
  if (lang === state.lang) {
    return;
  }

  setLang(lang);

  applyLangButtons();
  applyStaticTranslations();
  renderList();

  if (state.selectedId) {
    loadMenu();
  }

  updateAccountUI();
}

function applyLangButtons() {
  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === state.lang);
  });
}

function wireEvents() {
  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.addEventListener('click', () => {
      switchLanguage(button.dataset.lang);
    });
  });

  $('open-login').addEventListener('click', () => {
    openAuth('login');
  });

  $('open-register').addEventListener('click', () => {
    openAuth('register');
  });

  $('logout-btn').addEventListener('click', logout);

  $('open-profile').addEventListener('click', openProfile);

  $('auth-form').addEventListener('submit', handleAuthSubmit);

  $('auth-switch-btn').addEventListener('click', toggleAuthMode);

  $('profile-form').addEventListener('submit', handleProfileSubmit);

  $('avatar-upload-btn').addEventListener('click', handleAvatarUpload);

  $('favourite-btn').addEventListener('click', toggleFavourite);

  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('dialog').close();
    });
  });

  $('search-input').addEventListener('input', (event) => {
    setFilter('search', event.target.value);
  });

  $('city-filter').addEventListener('change', (event) => {
    setFilter('city', event.target.value);
  });

  $('company-filter').addEventListener('change', (event) => {
    setFilter('company', event.target.value);
  });

  $('clear-filters').addEventListener('click', clearFilters);

  $('find-nearest').addEventListener('click', () => {
    startFindNearest(locationNotify);
  });

  $('mode-daily').addEventListener('click', () => {
    setMenuMode('daily');
  });

  $('mode-weekly').addEventListener('click', () => {
    setMenuMode('weekly');
  });

  $('back-to-list').addEventListener('click', () => {
    document.body.classList.remove('show-detail');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  document.addEventListener('sfh:offline', showOfflineBanner);
}

async function init() {
  applyLangButtons();
  applyStaticTranslations();
  wireEvents();
  updateAccountUI();

  await loadRestaurants();
  await restoreSession();
}

document.addEventListener('DOMContentLoaded', init);
