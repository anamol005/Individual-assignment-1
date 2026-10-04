# StudentFood Hub

StudentFood Hub is a web application for finding student restaurants in Finland and checking their daily and weekly menus.

This project was made for the **TX00EY23 Web Application Development** course.

The website is built with **HTML, CSS and vanilla JavaScript** and uses the Metropolia Student Restaurants API.

## Features

- View student restaurants
- Search restaurants by name, address or city
- Filter restaurants by city and service provider
- View restaurant details
- View daily and weekly menus
- View restaurant locations on OpenStreetMap
- Find the nearest restaurant using browser location
- Register and log in
- Update profile information
- Upload a profile picture
- Save one favourite restaurant
- Switch between English and Finnish
- Responsive layout for desktop, tablet and mobile

## Running the project

The project uses JavaScript ES modules, so it should be opened with a local server.

The easiest way is to use **Visual Studio Code Live Server**.

1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension if needed.
3. Right-click `index.html`.
4. Choose **Open with Live Server**.

The project should open at an address like:

```text
http://127.0.0.1:5500/index.html
```

There is no build step needed to run the website.

## Metropolia API

The project uses the Metropolia Student Restaurants API.

Base URL:

```text
https://media2.edu.metropolia.fi/restaurant/api/v1
```

If the restaurant data does not load, connect to the **Metropolia network or VPN** and reload the page.

### API requests used

| Feature            | Request                             |
| ------------------ | ----------------------------------- |
| Restaurants        | `GET /restaurants`                  |
| Restaurant details | `GET /restaurants/:id`              |
| Daily menu         | `GET /restaurants/daily/:id/:lang`  |
| Weekly menu        | `GET /restaurants/weekly/:id/:lang` |
| Login              | `POST /auth/login`                  |
| Registration       | `POST /users`                       |
| Validate user      | `GET /users/token`                  |
| Update user        | `PUT /users`                        |
| Upload avatar      | `POST /users/avatar`                |

The restaurant `_id` is used as the restaurant ID.

The menu language can be `en` or `fi`.

## Favourite restaurant

A user can save one favourite restaurant.

If another restaurant is selected as favourite, it replaces the previous one.

## Map and nearest restaurant

The selected restaurant is shown on OpenStreetMap using coordinates from the API.

The **Find nearest** button uses the browser location to find the closest restaurant from the available restaurant coordinates.

The browser may ask for location permission.

## Languages

The application supports:

- English
- Finnish

The selected language is saved in LocalStorage.

## Project structure

```text
Individual-assignment/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── account.js
│   ├── api.js
│   ├── config.js
│   ├── i18n.js
│   ├── main.js
│   ├── menu.js
│   ├── restaurants.js
│   └── state.js
├── .editorconfig
├── .gitignore
├── .prettierrc.json
├── eslint.config.mjs
├── package.json
├── package-lock.json
└── README.md
```

## Technologies

- HTML5
- CSS
- JavaScript
- ES modules
- Fetch API
- LocalStorage
- Geolocation API
- OpenStreetMap
- Metropolia Student Restaurants API

The project also includes ESLint, Prettier and editor configuration files from the course template.

## Deployment

The application will be published on a public server as required by the assignment.

Live site:

```text
https://users.metropolia.fi/~anamolk/StudentFoodHub/
```

## Attribution

Map data is provided by **OpenStreetMap contributors**.

The project uses **Fraunces** and **Manrope** fonts.
