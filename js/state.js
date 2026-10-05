import {LS_TOKEN} from './config.js';

export const state = {
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
