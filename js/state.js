import {LS_LANG, LS_TOKEN} from './config.js';

export const state = {
  lang: localStorage.getItem(LS_LANG) || 'en',
  token: localStorage.getItem(LS_TOKEN) || null,

  user: null,

  restaurants: [],
  selectedId: null,
  nearestId: null,

  filters: {
    search: '',
    city: '',
    company: '',
  },

  menuMode: 'daily',
  weeklyDays: [],
};

export function setToken(token) {
  state.token = token;

  if (token) {
    localStorage.setItem(LS_TOKEN, token);
  } else {
    localStorage.removeItem(LS_TOKEN);
  }
}

export function setLang(lang) {
  state.lang = lang;
  localStorage.setItem(LS_LANG, lang);
}
