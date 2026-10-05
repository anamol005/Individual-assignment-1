import {state} from './state.js';
import {getRestaurants} from './api.js';
import {loadMenu} from './menu.js';

const $ = (id) => document.getElementById(id);

export async function loadRestaurants(showBanner) {
  const list = $('restaurant-list');

  list.innerHTML = `
    <div class="status-block">
      <div class="spinner"></div>
      Loading restaurants...
    </div>
  `;

  try {
    const data = await getRestaurants();

    state.restaurants = Array.isArray(data) ? data : [];

    populateFilters();
    renderList();
  } catch (error) {
    if (error.message === 'network' && showBanner) {
      showBanner(
        'Cannot reach the Metropolia restaurant API. Connect to the Metropolia network or VPN.',
        'error'
      );
    }

    list.innerHTML = `
      <div class="status-block error">
        Could not load restaurants.
        <div>
          <button class="btn btn-outline" id="retry-list">
            Try again
          </button>
        </div>
      </div>
    `;

    const retry = $('retry-list');

    if (retry) {
      retry.addEventListener('click', () => {
        loadRestaurants(showBanner);
      });
    }
  }
}

function populateFilters() {
  const cities = [];
  const companies = [];

  for (const restaurant of state.restaurants) {
    if (restaurant.city && !cities.includes(restaurant.city)) {
      cities.push(restaurant.city);
    }

    if (restaurant.company && !companies.includes(restaurant.company)) {
      companies.push(restaurant.company);
    }
  }

  cities.sort();
  companies.sort();

  fillSelect($('city-filter'), cities, state.filters.city);

  fillSelect($('company-filter'), companies, state.filters.company);
}

function fillSelect(select, values, current) {
  select.innerHTML = '';

  const all = document.createElement('option');

  all.value = '';
  all.textContent = 'All';

  select.appendChild(all);

  for (const value of values) {
    const option = document.createElement('option');

    option.value = value;
    option.textContent = value;

    select.appendChild(option);
  }

  select.value = current || '';
}

function getFilteredRestaurants() {
  const search = state.filters.search.trim().toLowerCase();

  const restaurants = state.restaurants.filter((restaurant) => {
    if (state.filters.city && restaurant.city !== state.filters.city) {
      return false;
    }

    if (state.filters.company && restaurant.company !== state.filters.company) {
      return false;
    }

    if (search) {
      const name = restaurant.name || '';
      const address = restaurant.address || '';
      const city = restaurant.city || '';

      const text = (name + ' ' + address + ' ' + city).toLowerCase();

      if (!text.includes(search)) {
        return false;
      }
    }

    return true;
  });

  restaurants.sort((a, b) => {
    return (a.name || '').localeCompare(b.name || '');
  });

  return restaurants;
}

export function renderList() {
  const list = $('restaurant-list');
  const restaurants = getFilteredRestaurants();

  if (restaurants.length === 1) {
    $('list-count').textContent = '1 restaurant';
  } else {
    $('list-count').textContent = restaurants.length + ' restaurants';
  }

  list.innerHTML = '';

  if (restaurants.length === 0) {
    list.innerHTML = `
      <div class="status-block">
        No restaurants match your search or filters.
      </div>
    `;

    return;
  }

  let favouriteId = null;

  if (state.user) {
    favouriteId = state.user.favouriteRestaurant;
  }

  for (const restaurant of restaurants) {
    const card = document.createElement('button');

    card.type = 'button';
    card.className = 'restaurant-card';
    card.dataset.restaurantId = restaurant._id;

    if (restaurant._id === state.selectedId) {
      card.classList.add('selected');
    }

    if (restaurant._id === state.nearestId) {
      card.classList.add('nearest');
    }

    const name = document.createElement('div');

    name.className = 'rc-name';
    name.textContent = restaurant.name || 'Unnamed restaurant';

    if (favouriteId && restaurant._id === favouriteId) {
      const badge = document.createElement('span');

      badge.className = 'badge badge-fav';
      badge.textContent = '★';

      name.appendChild(badge);
    }

    if (restaurant._id === state.nearestId) {
      const badge = document.createElement('span');

      badge.className = 'badge badge-near';
      badge.textContent = 'Nearest';

      name.appendChild(badge);
    }

    const sub = document.createElement('div');

    sub.className = 'rc-sub';

    const address = restaurant.address || '';
    const city = restaurant.city || '';

    if (address && city) {
      sub.textContent = address + ', ' + city;
    } else {
      sub.textContent = address || city;
    }

    card.appendChild(name);
    card.appendChild(sub);

    card.addEventListener('click', () => {
      selectRestaurant(restaurant._id);
    });

    list.appendChild(card);
  }
}

export function selectRestaurant(id) {
  state.selectedId = id;
  state.menuMode = 'daily';

  const restaurant = state.restaurants.find((item) => item._id === id);

  if (!restaurant) {
    return;
  }

  renderDetail(restaurant);
  renderList();

  document.body.classList.add('show-detail');

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  buildMap(restaurant);
  setMenuMode('daily');
}

export function renderDetail(restaurant) {
  $('detail-empty').classList.add('hidden');

  $('detail-content').classList.remove('hidden');

  $('detail-name').textContent = restaurant.name || 'Unnamed restaurant';

  setInfo('detail-address', restaurant.address);

  setInfo('detail-city', restaurant.city);

  setInfo('detail-postal', restaurant.postalCode);

  setInfo('detail-phone', restaurant.phone);

  setInfo('detail-company', restaurant.company);

  renderFavouriteButton(restaurant);
}

function setInfo(id, value) {
  const element = $(id);

  if (value) {
    element.textContent = value;
    element.classList.remove('missing');
  } else {
    element.textContent = '—';
    element.classList.add('missing');
  }
}

function renderFavouriteButton(restaurant) {
  const button = $('favourite-btn');

  const note = $('favourite-note');

  if (!state.user) {
    button.textContent = 'Log in to save a favourite';

    button.classList.remove('is-fav');

    button.disabled = false;

    note.classList.add('hidden');

    return;
  }

  note.classList.remove('hidden');

  note.textContent =
    'You can save one favourite restaurant. Choosing another one replaces it.';

  const isFavourite = state.user.favouriteRestaurant === restaurant._id;

  button.disabled = false;

  if (isFavourite) {
    button.textContent = '★ Your favourite';

    button.classList.add('is-fav');
  } else {
    button.textContent = 'Set as my favourite';

    button.classList.remove('is-fav');
  }
}

export function setMenuMode(mode) {
  state.menuMode = mode;

  $('mode-daily').classList.toggle('active', mode === 'daily');

  $('mode-weekly').classList.toggle('active', mode === 'weekly');

  loadMenu();
}

function buildMap(restaurant) {
  const coordinates = restaurant.location?.coordinates;

  const empty = $('map-empty');
  const wrap = $('map-wrap');

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    showNoMap();
    return;
  }

  const longitude = Number(coordinates[0]);

  const latitude = Number(coordinates[1]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    showNoMap();
    return;
  }

  empty.classList.add('hidden');
  wrap.classList.remove('hidden');

  const distance = 0.008;

  const bbox =
    longitude -
    distance +
    ',' +
    (latitude - distance) +
    ',' +
    (longitude + distance) +
    ',' +
    (latitude + distance);

  $('map-frame').src =
    'https://www.openstreetmap.org/export/embed.html?bbox=' +
    bbox +
    '&layer=mapnik&marker=' +
    latitude +
    ',' +
    longitude;

  $('map-larger').href =
    'https://www.openstreetmap.org/?mlat=' +
    latitude +
    '&mlon=' +
    longitude +
    '#map=16/' +
    latitude +
    '/' +
    longitude;
}

function showNoMap() {
  $('map-wrap').classList.add('hidden');

  $('map-empty').classList.remove('hidden');

  $('map-empty').querySelector('p').textContent =
    'No valid coordinates for this restaurant.';
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const radius = 6371;

  const toRadians = (degree) => {
    return (degree * Math.PI) / 180;
  };

  const latDifference = toRadians(lat2 - lat1);

  const lonDifference = toRadians(lon2 - lon1);

  const a =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(lonDifference / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function startFindNearest(setBanner) {
  if (!('geolocation' in navigator)) {
    setBanner('Your browser does not support location.', 'error');

    return;
  }

  setBanner('Finding your location...', '');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;

      const longitude = position.coords.longitude;

      let nearestRestaurant = null;
      let nearestDistance = Infinity;

      for (const restaurant of state.restaurants) {
        const coordinates = restaurant.location?.coordinates;

        if (!Array.isArray(coordinates)) {
          continue;
        }

        const restaurantLongitude = Number(coordinates[0]);

        const restaurantLatitude = Number(coordinates[1]);

        if (
          !Number.isFinite(restaurantLatitude) ||
          !Number.isFinite(restaurantLongitude)
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
        setBanner('No restaurants have valid coordinates to compare.', 'error');

        return;
      }

      state.nearestId = nearestRestaurant._id;

      renderList();

      setBanner('Nearest restaurant highlighted in the list.', '');

      const card = document.querySelector(
        `[data-restaurant-id="${nearestRestaurant._id}"]`
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
        setBanner('Location permission was denied.', 'error');
      } else {
        setBanner('Your location is currently unavailable.', 'error');
      }
    }
  );
}

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
