import {state} from './state.js';
import {getDailyMenu, getWeeklyMenu} from './api.js';

const $ = (id) => document.getElementById(id);

function formatDay(dateText) {
  if (!dateText) {
    return {
      name: '',
      date: '',
    };
  }

  const parts = dateText.trim().split(' ');

  if (parts.length >= 3) {
    return {
      name: parts[0].slice(0, 3),
      date: parts[1] + ' ' + parts[2].slice(0, 4),
    };
  }

  return {
    name: dateText,
    date: '',
  };
}

function createPrice(price) {
  const element = document.createElement('div');
  element.className = 'course-price';

  if (price) {
    element.textContent = price;
  } else {
    element.textContent = 'Price not available';
    element.classList.add('missing');
  }

  return element;
}

function createCourse(course) {
  const row = document.createElement('div');
  row.className = 'course';

  const main = document.createElement('div');
  main.className = 'course-main';

  const name = document.createElement('div');
  name.className = 'course-name';
  name.textContent = course.name || 'Unnamed dish';

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
    missing.textContent = 'No dietary information';

    diets.appendChild(missing);
  }

  main.appendChild(diets);

  row.appendChild(main);
  row.appendChild(createPrice(course.price));

  return row;
}

function renderCourses(courses) {
  const container = $('menu-container');

  container.innerHTML = '';

  if (!Array.isArray(courses) || courses.length === 0) {
    container.innerHTML = `
      <div class="status-block">
        No menu is available for this day.
      </div>
    `;

    return;
  }

  for (const course of courses) {
    container.appendChild(createCourse(course));
  }
}

function showMenuStatus(type) {
  const container = $('menu-container');

  if (type === 'loading') {
    container.innerHTML = `
      <div class="status-block">
        <div class="spinner"></div>
        Loading menu...
      </div>
    `;
  }

  if (type === 'error') {
    container.innerHTML = `
      <div class="status-block error">
        Could not load the menu.
      </div>
    `;
  }
}

function renderDaySelector(days) {
  const selector = $('day-selector');

  selector.innerHTML = '';

  if (!Array.isArray(days) || days.length === 0) {
    selector.classList.add('hidden');
    renderCourses([]);
    return;
  }

  selector.classList.remove('hidden');

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const label = formatDay(day.date);

    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'day-btn';

    if (i === 0) {
      button.classList.add('active');
    }

    button.innerHTML = `
      <span class="day-name">${label.name}</span>
      <span class="day-date">${label.date}</span>
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
  }

  renderCourses(days[0].courses);
}

export async function loadMenu() {
  const id = state.selectedId;

  if (!id) {
    return;
  }

  $('day-selector').classList.add('hidden');

  showMenuStatus('loading');

  try {
    if (state.menuMode === 'daily') {
      const courses = await getDailyMenu(id, 'en');

      renderCourses(courses);
    } else {
      const days = await getWeeklyMenu(id, 'en');

      renderDaySelector(days);
    }
  } catch {
    showMenuStatus('error');
  }
}
