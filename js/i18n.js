import {state} from './state.js';

const dict = {
  en: {
    'nav.login': 'Log in',
    'nav.register': 'Register',
    'nav.logout': 'Log out',

    'search.label': 'Search restaurants',
    'search.placeholder': 'Search by name, address or city',

    'filter.city': 'City',
    'filter.company': 'Provider',
    'filter.all': 'All',
    'filter.clear': 'Clear',

    'nearest.button': 'Find nearest',
    'nearest.locating': 'Finding your location…',
    'nearest.denied':
      'Location permission was denied. You can enable it in your browser settings.',
    'nearest.unavailable':
      'Your location is currently unavailable. Please try again.',
    'nearest.unsupported': 'Your browser does not support location.',
    'nearest.noCoords': 'No restaurants have valid coordinates to compare.',
    'nearest.done': 'Nearest restaurant highlighted in the list.',
    'nearest.badge': 'Nearest',

    'list.title': 'Restaurants',
    'list.loading': 'Loading restaurants…',
    'list.empty': 'No restaurants match your search or filters.',
    'list.error': 'Could not load restaurants.',
    'list.retry': 'Try again',
    'list.count.one': '{n} restaurant',
    'list.count.other': '{n} restaurants',

    'details.select': 'Select a restaurant to see its details and menu.',
    'details.backToList': '← Back to restaurants',
    'details.address': 'Address',
    'details.city': 'City',
    'details.postal': 'Postal code',
    'details.phone': 'Phone',
    'details.company': 'Provider',
    'details.setFavourite': 'Set as my favourite',
    'details.yourFavourite': '★ Your favourite',
    'details.favouriteNote':
      'You can save one favourite restaurant. Choosing another one replaces it.',
    'details.loginToFav': 'Log in to save a favourite',

    'menu.daily': 'Daily menu',
    'menu.weekly': 'Weekly menu',
    'menu.loading': 'Loading menu…',
    'menu.empty': 'No menu is available for this day.',
    'menu.error': 'Could not load the menu.',

    'price.missing': 'Price not available',
    'diets.missing': 'No dietary information',
    'name.missing': 'Unnamed dish',

    'map.title': 'Location',
    'map.selectHint': 'Select a restaurant to see it on the map.',
    'map.larger': 'View larger map',
    'map.attribution': '© OpenStreetMap contributors',
    'map.noCoords': 'No valid coordinates for this restaurant.',

    'auth.username': 'Username',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loginTitle': 'Log in',
    'auth.registerTitle': 'Create an account',
    'auth.loginSubmit': 'Log in',
    'auth.registerSubmit': 'Register',
    'auth.working': 'Please wait…',
    'auth.needAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.switchToRegister': 'Register',
    'auth.switchToLogin': 'Log in',
    'auth.loginFailed': 'Login failed. Check your username and password.',
    'auth.registerFailed': 'Registration failed.',
    'auth.registerSuccess': 'Account created. You can now log in.',
    'auth.activation': 'Please activate your account using this link:',
    'auth.required': 'Please fill in all required fields.',
    'auth.sessionExpired': 'Your session expired. Please log in again.',

    'profile.title': 'Edit profile',
    'profile.save': 'Save changes',
    'profile.newPassword': 'New password (leave blank to keep)',
    'profile.chooseAvatar': 'Choose picture',
    'profile.upload': 'Upload',
    'profile.saved': 'Profile updated.',
    'profile.saveFailed': 'Could not update profile.',
    'profile.avatarChoose': 'Please choose an image first.',
    'profile.avatarUploaded': 'Profile picture updated.',
    'profile.avatarFailed': 'Could not upload picture.',
    'profile.uploading': 'Uploading…',

    'footer.note':
      'Course project using the Metropolia Student Restaurants API',

    'conn.offline':
      'Cannot reach the Metropolia restaurant API. Connect to the Metropolia network or VPN.',
  },

  fi: {
    'nav.login': 'Kirjaudu',
    'nav.register': 'Rekisteröidy',
    'nav.logout': 'Kirjaudu ulos',

    'search.label': 'Hae ravintoloita',
    'search.placeholder': 'Hae nimellä, osoitteella tai kaupungilla',

    'filter.city': 'Kaupunki',
    'filter.company': 'Palveluntarjoaja',
    'filter.all': 'Kaikki',
    'filter.clear': 'Tyhjennä',

    'nearest.button': 'Etsi lähin',
    'nearest.locating': 'Haetaan sijaintiasi…',
    'nearest.denied':
      'Sijaintilupa evättiin. Voit sallia sen selaimen asetuksista.',
    'nearest.unavailable': 'Sijaintiasi ei juuri nyt saada. Yritä uudelleen.',
    'nearest.unsupported': 'Selaimesi ei tue sijaintia.',
    'nearest.noCoords':
      'Yhdelläkään ravintolalla ei ole vertailtavia koordinaatteja.',
    'nearest.done': 'Lähin ravintola on korostettu listassa.',
    'nearest.badge': 'Lähin',

    'list.title': 'Ravintolat',
    'list.loading': 'Ladataan ravintoloita…',
    'list.empty': 'Yksikään ravintola ei vastaa hakua tai suodattimia.',
    'list.error': 'Ravintoloita ei voitu ladata.',
    'list.retry': 'Yritä uudelleen',
    'list.count.one': '{n} ravintola',
    'list.count.other': '{n} ravintolaa',

    'details.select': 'Valitse ravintola nähdäksesi sen tiedot ja ruokalistan.',
    'details.backToList': '← Takaisin ravintoloihin',
    'details.address': 'Osoite',
    'details.city': 'Kaupunki',
    'details.postal': 'Postinumero',
    'details.phone': 'Puhelin',
    'details.company': 'Palveluntarjoaja',
    'details.setFavourite': 'Aseta suosikiksi',
    'details.yourFavourite': '★ Suosikkisi',
    'details.favouriteNote':
      'Voit tallentaa yhden suosikkiravintolan. Toisen valinta korvaa sen.',
    'details.loginToFav': 'Kirjaudu tallentaaksesi suosikin',

    'menu.daily': 'Päivän lista',
    'menu.weekly': 'Viikon lista',
    'menu.loading': 'Ladataan ruokalistaa…',
    'menu.empty': 'Tälle päivälle ei ole ruokalistaa.',
    'menu.error': 'Ruokalistaa ei voitu ladata.',

    'price.missing': 'Hintaa ei saatavilla',
    'diets.missing': 'Ei ruokavaliotietoja',
    'name.missing': 'Nimetön annos',

    'map.title': 'Sijainti',
    'map.selectHint': 'Valitse ravintola nähdäksesi sen kartalla.',
    'map.larger': 'Avaa suurempi kartta',
    'map.attribution': '© OpenStreetMap-tekijät',
    'map.noCoords': 'Ravintolalla ei ole kelvollisia koordinaatteja.',

    'auth.username': 'Käyttäjänimi',
    'auth.email': 'Sähköposti',
    'auth.password': 'Salasana',
    'auth.loginTitle': 'Kirjaudu sisään',
    'auth.registerTitle': 'Luo tili',
    'auth.loginSubmit': 'Kirjaudu',
    'auth.registerSubmit': 'Rekisteröidy',
    'auth.working': 'Odota hetki…',
    'auth.needAccount': 'Eikö sinulla ole tiliä?',
    'auth.haveAccount': 'Onko sinulla jo tili?',
    'auth.switchToRegister': 'Rekisteröidy',
    'auth.switchToLogin': 'Kirjaudu',
    'auth.loginFailed':
      'Kirjautuminen epäonnistui. Tarkista käyttäjänimi ja salasana.',
    'auth.registerFailed': 'Rekisteröinti epäonnistui.',
    'auth.registerSuccess': 'Tili luotu. Voit nyt kirjautua sisään.',
    'auth.activation': 'Aktivoi tilisi tästä linkistä:',
    'auth.required': 'Täytä kaikki pakolliset kentät.',
    'auth.sessionExpired': 'Istuntosi vanheni. Kirjaudu uudelleen.',

    'profile.title': 'Muokkaa profiilia',
    'profile.save': 'Tallenna muutokset',
    'profile.newPassword': 'Uusi salasana (jätä tyhjäksi säilyttääksesi)',
    'profile.chooseAvatar': 'Valitse kuva',
    'profile.upload': 'Lataa',
    'profile.saved': 'Profiili päivitetty.',
    'profile.saveFailed': 'Profiilia ei voitu päivittää.',
    'profile.avatarChoose': 'Valitse ensin kuva.',
    'profile.avatarUploaded': 'Profiilikuva päivitetty.',
    'profile.avatarFailed': 'Kuvaa ei voitu ladata.',
    'profile.uploading': 'Ladataan…',

    'footer.note':
      'Kurssiprojekti, joka käyttää Metropolian opiskelijaravintola-APIa',

    'conn.offline':
      'Metropolian ravintola-APIin ei saada yhteyttä. Yhdistä Metropolian verkkoon tai VPN:ään.',
  },
};

export function t(key, params) {
  const table = dict[state.lang] || dict.en;
  let text = table[key] != null ? table[key] : key;

  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace('{' + name + '}', value);
    }
  }

  return text;
}

export function countText(number) {
  if (number === 1) {
    return t('list.count.one', {n: number});
  }

  return t('list.count.other', {n: number});
}

export function applyStaticTranslations() {
  document.documentElement.lang = state.lang;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.setAttribute('placeholder', t(key));
  });
}
