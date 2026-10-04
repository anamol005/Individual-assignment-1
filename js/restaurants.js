import {state} from './state.js';
import {t, countText} from './i18n.js';
import {getRestaurants, getRestaurant, ApiError} from './api.js';
import {loadMenu} from './menu.js';

const $ = (id) => document.getElementById(id);

/* ---------------- Data loading ---------------- */

// Load the restaurant list from the API.
export async function loadRestaurants() {
  const list = $('restaurant-list');

  list.innerHTML = `
    <div class="status-block">
      <div class="spinner"></div>
      ${t('list.loading')}
    </div>
  `;

  try {
    const data = await getRestaurants();

    state.restaurants = Array.isArray(data) ? data : [];

    afterRestaurantsLoaded();
  } catch (err) {
    if (err instanceof ApiError && err.network) {
      document.dispatchEvent(new CustomEvent('sfh:offline'));
    }

    list.innerHTML = `
      <div class="status-block error">
        ${t('list.error')}
        <div style="margin-top:.6rem">
          <button class="btn btn-outline" id="retry-list">
            ${t('list.retry')}
          </button>
        </div>
      </div>
    `;

    const retry = $('retry-list');

    if (retry) {
      retry.addEventListener('click', loadRestaurants);
    }
  }
}

function afterRestaurantsLoaded() {
  populateFilters();
  renderList();
}

/* ---------------- Filters ---------------- */

// Fill the city and provider dropdowns.
function populateFilters() {
  const cities = [
    ...new Set(state.restaurants.map((r) => r.city).filter(Boolean)),
  ].sort();

  const companies = [
    ...new Set(state.restaurants.map((r) => r.company).filter(Boolean)),
  ].sort();

  fillSelect($('city-filter'), cities, state.filters.city);
  fillSelect($('company-filter'), companies, state.filters.company);
}

function fillSelect(select, values, current) {
  select.innerHTML = '';

  const all = document.createElement('option');
  all.value = '';
  all.textContent = t('filter.all');
  select.appendChild(all);

  values.forEach((value) => {
    const option = document.createElement('option');

    option.value = value;
    option.textContent = value;

    select.appendChild(option);
  });

  select.value = current || '';
}

// Return restaurants that match the filters.
function getFilteredRestaurants() {
  const search = state.filters.search.trim().toLowerCase();

  return state.restaurants
    .filter((restaurant) => {
      if (state.filters.city && restaurant.city !== state.filters.city) {
        return false;
      }

      if (
        state.filters.company &&
        restaurant.company !== state.filters.company
      ) {
        return false;
      }

      if (search) {
        const text = [restaurant.name, restaurant.address, restaurant.city]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!text.includes(search)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      return (a.name || '').localeCompare(b.name || '');
    });
}

/* ---------------- List rendering ---------------- */

export function renderList() {
  const list = $('restaurant-list');
  const restaurants = getFilteredRestaurants();

  $('list-count').textContent = countText(restaurants.length);

  list.innerHTML = '';

  if (restaurants.length === 0) {
    list.innerHTML = `
      <div class="status-block">
        ${t('list.empty')}
      </div>
    `;

    return;
  }

  const favouriteId = state.user?.favouriteRestaurant || null;

  restaurants.forEach((restaurant) => {
    const card = document.createElement('button');

    card.type = 'button';
    card.className = 'restaurant-card';

    card.dataset.testid = 'restaurant-card-' + restaurant._id;

    if (restaurant._id === state.selectedId) {
      card.classList.add('selected');
    }

    if (restaurant._id === state.nearestId) {
      card.classList.add('nearest');
    }

    const name = document.createElement('div');

    name.className = 'rc-name';
    name.textContent = restaurant.name || t('name.missing');

    if (favouriteId && restaurant._id === favouriteId) {
      const badge = document.createElement('span');

      badge.className = 'badge badge-fav';
      badge.textContent = '★';

      name.appendChild(badge);
    }

    if (restaurant._id === state.nearestId) {
      const badge = document.createElement('span');

      badge.className = 'badge badge-near';
      badge.textContent = t('nearest.badge');

      name.appendChild(badge);
    }

    const sub = document.createElement('div');

    sub.className = 'rc-sub';

    sub.textContent =
      [restaurant.address, restaurant.city].filter(Boolean).join(', ') || '';

    card.appendChild(name);
    card.appendChild(sub);

    card.addEventListener('click', () => {
      selectRestaurant(restaurant._id);
    });

    list.appendChild(card);
  });
}

/* ---------------- Selection + details ---------------- */

export async function selectRestaurant(id) {
  state.selectedId = id;
  state.menuMode = 'daily';

  const cached = state.restaurants.find((restaurant) => restaurant._id === id);

  if (!cached) {
    return;
  }

  renderDetail(cached);

  renderList();

  document.body.classList.add('show-detail');

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  buildMap(cached);

  setMenuMode('daily');

  // Get fresh restaurant details from the API.
  try {
    const fresh = await getRestaurant(id);

    if (fresh && fresh._id === state.selectedId) {
      Object.assign(cached, fresh);

      renderDetail(cached);
      buildMap(cached);
    }
  } catch (error) {
    // Keep the restaurant data already loaded.
  }
}

// Show the selected restaurant information.
export function renderDetail(restaurant) {
  $('detail-empty').classList.add('hidden');
  $('detail-content').classList.remove('hidden');

  $('detail-name').textContent = restaurant.name || t('name.missing');

  setInfo('detail-address', restaurant.address);
  setInfo('detail-city', restaurant.city);
  setInfo('detail-postal', restaurant.postalCode);
  setInfo('detail-phone', restaurant.phone);
  setInfo('detail-company', restaurant.company);

  renderFavouriteButton(restaurant);
}

function setInfo(id, value) {
  const element = $(id);

  if (value && String(value).trim()) {
    element.textContent = value;
    element.classList.remove('missing');
  } else {
    element.textContent = '—';
    element.classList.add('missing');
  }
}

// Update the favourite button.
function renderFavouriteButton(restaurant) {
  const button = $('favourite-btn');
  const note = $('favourite-note');

  if (!state.user) {
    button.textContent = t('details.loginToFav');
    button.classList.remove('is-fav');
    button.disabled = false;

    note.classList.add('hidden');

    return;
  }

  note.classList.remove('hidden');
  note.textContent = t('details.favouriteNote');

  const isFavourite = state.user.favouriteRestaurant === restaurant._id;

  button.disabled = false;

  if (isFavourite) {
    button.textContent = t('details.yourFavourite');
    button.classList.add('is-fav');
  } else {
    button.textContent = t('details.setFavourite');
    button.classList.remove('is-fav');
  }
}

/* ---------------- Menu mode buttons ---------------- */

export function setMenuMode(mode) {
  state.menuMode = mode;

  $('mode-daily').classList.toggle('active', mode === 'daily');

  $('mode-weekly').classList.toggle('active', mode === 'weekly');

  loadMenu();
}

/* ---------------- Map ---------------- */

// API coordinates are longitude first and latitude second.
function buildMap(restaurant) {
  const coordinates = restaurant.location?.coordinates;

  const empty = $('map-empty');
  const wrap = $('map-wrap');

  const longitude = Array.isArray(coordinates) ? Number(coordinates[0]) : NaN;

  const latitude = Array.isArray(coordinates) ? Number(coordinates[1]) : NaN;

  const valid =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    !(latitude === 0 && longitude === 0);

  if (!valid) {
    wrap.classList.add('hidden');
    empty.classList.remove('hidden');

    empty.querySelector('p').textContent = t('map.noCoords');

    return;
  }

  empty.classList.add('hidden');
  wrap.classList.remove('hidden');

  const distance = 0.008;

  const bbox =
    `${longitude - distance},` +
    `${latitude - distance},` +
    `${longitude + distance},` +
    `${latitude + distance}`;

  $('map-frame').src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}` +
    `&layer=mapnik&marker=${latitude},${longitude}`;

  $('map-larger').href =
    `https://www.openstreetmap.org/?mlat=${latitude}` +
    `&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}

/* ---------------- Find nearest ---------------- */

function haversineKm(lat1, lon1, lat2, lon2) {
  const radius = 6371;

  const toRadians = (degree) => (degree * Math.PI) / 180;

  const latitudeDifference = toRadians(lat2 - lat1);

  const longitudeDifference = toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function startFindNearest(setBanner) {
  if (!('geolocation' in navigator)) {
    setBanner(t('nearest.unsupported'), 'error');

    return;
  }

  setBanner(t('nearest.locating'), '');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;

      const longitude = position.coords.longitude;

      let nearestRestaurant = null;
      let nearestDistance = Infinity;

      for (const restaurant of state.restaurants) {
        const coordinates = restaurant.location?.coordinates;

        const restaurantLongitude = Array.isArray(coordinates)
          ? Number(coordinates[0])
          : NaN;

        const restaurantLatitude = Array.isArray(coordinates)
          ? Number(coordinates[1])
          : NaN;

        if (
          !Number.isFinite(restaurantLatitude) ||
          !Number.isFinite(restaurantLongitude)
        ) {
          continue;
        }

        if (
          Math.abs(restaurantLatitude) > 90 ||
          Math.abs(restaurantLongitude) > 180
        ) {
          continue;
        }

        const distance = haversineKm(
          latitude,
          longitude,
          restaurantLatitude,
          restaurantLongitude
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestRestaurant = restaurant;
        }
      }

      if (!nearestRestaurant) {
        setBanner(t('nearest.noCoords'), 'error');

        return;
      }

      state.nearestId = nearestRestaurant._id;

      renderList();

      setBanner(t('nearest.done'), '');

      const card = document.querySelector(
        `[data-testid="restaurant-card-${nearestRestaurant._id}"]`
      );

      if (card) {
        card.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    },

    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        setBanner(t('nearest.denied'), 'error');
      } else {
        setBanner(t('nearest.unavailable'), 'error');
      }
    },

    {
      enableHighAccuracy: false,
      timeout: 10000,
    }
  );
}

/* ---------------- Public helpers ---------------- */

export function setFilter(key, value) {
  state.filters[key] = value;

  renderList();
}

export function clearFilters() {
  state.filters = {
    search: '',
    city: '',
    company: '',
  };

  $('search-input').value = '';
  $('city-filter').value = '';
  $('company-filter').value = '';

  renderList();
}

export function refreshSelectedDetail() {
  const restaurant = state.restaurants.find(
    (item) => item._id === state.selectedId
  );

  if (restaurant) {
    renderDetail(restaurant);
  }
}
