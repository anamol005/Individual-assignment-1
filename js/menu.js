import {state} from './state.js';
import {t} from './i18n.js';
import {getDailyMenu, getWeeklyMenu} from './api.js';

const menuContainer = () => document.getElementById('menu-container');
const daySelector = () => document.getElementById('day-selector');

function formatDay(dateStr) {
  if (!dateStr) {
    return {
      name: '',
      date: '',
    };
  }

  const parts = dateStr.trim().split(' ');

  if (parts.length >= 3) {
    return {
      name: parts[0].slice(0, 3),
      date: parts[1] + ' ' + parts[2].slice(0, 4),
    };
  }

  return {
    name: dateStr,
    date: '',
  };
}

function priceElement(price) {
  const element = document.createElement('div');

  element.className = 'course-price';

  if (price) {
    element.textContent = price;
  } else {
    element.textContent = t('price.missing');
    element.classList.add('missing');
  }

  return element;
}

function courseElement(course) {
  const row = document.createElement('div');
  row.className = 'course';

  const main = document.createElement('div');
  main.className = 'course-main';

  const name = document.createElement('div');
  name.className = 'course-name';
  name.textContent = course.name || t('name.missing');

  main.appendChild(name);

  const diets = document.createElement('div');
  diets.className = 'course-diets';

  let dietList = [];

  if (Array.isArray(course.diets)) {
    dietList = course.diets;
  } else if (typeof course.diets === 'string' && course.diets.trim()) {
    dietList = course.diets.split(/[,\s]+/);
  }

  if (dietList.length > 0) {
    for (const diet of dietList) {
      if (!diet) {
        continue;
      }

      const chip = document.createElement('span');

      chip.className = 'diet-chip';
      chip.textContent = diet.trim();

      diets.appendChild(chip);
    }
  } else {
    const missing = document.createElement('span');

    missing.className = 'missing';
    missing.textContent = t('diets.missing');

    diets.appendChild(missing);
  }

  main.appendChild(diets);

  row.appendChild(main);
  row.appendChild(priceElement(course.price));

  return row;
}

function renderCourses(courses) {
  const container = menuContainer();

  container.innerHTML = '';

  if (!Array.isArray(courses) || courses.length === 0) {
    container.innerHTML = `
      <div class="status-block">
        ${t('menu.empty')}
      </div>
    `;

    return;
  }

  for (const course of courses) {
    container.appendChild(courseElement(course));
  }
}

function showMenuStatus(type) {
  const container = menuContainer();

  if (type === 'loading') {
    container.innerHTML = `
      <div class="status-block">
        <div class="spinner"></div>
        ${t('menu.loading')}
      </div>
    `;
  }

  if (type === 'error') {
    container.innerHTML = `
      <div class="status-block error">
        ${t('menu.error')}
      </div>
    `;
  }
}

function renderDaySelector() {
  const selector = daySelector();

  selector.innerHTML = '';
  selector.classList.remove('hidden');

  if (!state.weeklyDays || state.weeklyDays.length === 0) {
    renderCourses([]);
    return;
  }

  state.weeklyDays.forEach((day, index) => {
    const label = formatDay(day.date);

    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'day-btn';

    if (index === 0) {
      button.classList.add('active');
    }

    button.innerHTML = `
      <span class="day-name">
        ${label.name}
      </span>

      <span class="day-date">
        ${label.date}
      </span>
    `;

    button.addEventListener('click', () => {
      const buttons = selector.querySelectorAll('.day-btn');

      for (const item of buttons) {
        item.classList.remove('active');
      }

      button.classList.add('active');

      renderCourses(day.courses);
    });

    selector.appendChild(button);
  });

  renderCourses(state.weeklyDays[0].courses);
}

export async function loadMenu() {
  const id = state.selectedId;

  if (!id) {
    return;
  }

  daySelector().classList.add('hidden');

  showMenuStatus('loading');

  try {
    if (state.menuMode === 'daily') {
      const courses = await getDailyMenu(id, state.lang);

      renderCourses(courses);
    } else {
      const days = await getWeeklyMenu(id, state.lang);

      state.weeklyDays = days;

      renderDaySelector();
    }
  } catch (error) {
    console.log(error);
    showMenuStatus('error');
  }
}
