# ComeYCalla

**Save your favorite recipes, plan your week, and get the shopping list done automatically.**

ComeYCalla is a full-stack web app built as my final degree project (Higher Vocational Degree in Web Application Development, IES Camp de Morvedre). It is not a recipe search engine and it does not count calories: it is built around the recipes *you already cook and love*, the ones that usually end up lost in screenshots, social media posts and phone notes.

> The live deployment was taken offline to avoid hosting costs. See the demos and screenshots below.

## Demos

Create recipe with URL
![Demo](docs/demo-import.gif)

Create daily menu and shopping list
![Demo](docs/demo-menu.gif)

## Features

- **Accounts and authentication:** register, log in and manage a personal profile. Private routes are protected with Spring Security and JWT.
- **Recipe management:** create, edit, view and delete recipes with categories, tags, difficulty, time, servings, ingredients and ordered steps. Search and filter your collection.
- **Import from images (OCR):** upload one image of a recipe, or several images split by section (photo, title, ingredients, steps). Google Vision API extracts the text and the backend classifies each line into the right form field.
- **Import from a URL:** paste a recipe link and the backend downloads the page with Jsoup, extracts title, description, ingredients, steps and main image, and pre-fills the form.
- **Review before saving:** every imported recipe goes through an editable preview, so you can correct anything before it is stored.
- **Flexible weekly menu:** choose 1 to 7 days, which meals per day (breakfast, lunch, dinner) and whether recipes can repeat. Regenerate the whole menu or swap a single meal.
- **Shopping list:** generated from the menu, with ingredients grouped by food category, a progress bar, check/uncheck all and print.
- **Validation and error handling:** reactive forms with dynamic errors in the frontend, Bean Validation and a global error handler in the backend, and clear messages when a page or image cannot be processed.

## Screenshots

| Import from images | Import from URL | Weekly menu |
|---|---|---|
| ![](docs/import-image.png) | ![](docs/import-url.png) | ![](docs/menu.png) |

| Shopping list | Recipe detail | Login |
|---|---|---|
| ![](docs/shopping-list.png) | ![](docs/recipe-detail.png) | ![](docs/login.png) |

The UI was designed first in Figma: [view the prototype](https://www.figma.com/design/LMReAQ1W1nl2oGS6U8Vtmb/Comeycalla?node-id=2050-676&t=EydG3Bcp12x4dULE-1).

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | Angular 17, TypeScript, reactive forms, reusable shared components |
| Backend | Java 17, Spring Boot, Spring Security + JWT, Spring Data JPA / Hibernate, MapStruct, Lombok, Bean Validation |
| Database | MySQL (9 tables), local environment with Docker Compose |
| External services | Google Vision API (OCR), Cloudinary (image storage), Jsoup (HTML parsing) |
| Design | Figma, Nunito font, Material icons |
| Deployment | Vercel (frontend), Railway (backend and database), continuous deployment from GitHub |

## Architecture

Three-layer architecture with a decoupled frontend and backend.

```
                                         ┌──────────────┐
                                    ┌──▶ │  Cloudinary  │  image storage
┌──────────────┐   REST / JSON  ┌───┴──────────┐        └──────────────┘
│   Angular    │ ─────────────▶ │ Spring Boot  │ ─────▶ ┌──────────────┐
│   (Vercel)   │ ◀───────────── │  (Railway)   │        │    MySQL     │
└──────────────┘                └───┬──────────┘        └──────────────┘
                                    │                   ┌──────────────┐
                                    └──────────────────▶│ Google Vision│  OCR
                                                        └──────────────┘
```

**Backend** is organized by feature (`auth`, `recipe`, `mealplan`, `shoppinglist`, `user`, `imports`, `config`, `common`), each with its own controller, service, repository, entity, DTO and mapper. DTOs keep entities from being exposed directly, and MapStruct handles the conversions.

**Frontend** follows a `core` / `features` / `layout` / `shared` structure, with separate layouts for public (`AuthLayout`) and private (`AppShell`) pages, route guards and an HTTP interceptor for the JWT.

### Database

Nine tables: `users`, `recipes`, `recipe_ingredients`, `recipe_steps`, `tags`, `recipe_tags` (many-to-many), `meal_plans`, `meal_plan_days` and `meal_slots`. Ingredients and steps are stored in their own tables so they can be added, removed and reordered dynamically from the frontend.

## How the import works

**From images**

1. The user uploads one or several images, which are stored in Cloudinary.
2. The backend sends them to Google Vision API and gets the raw text.
3. A rule-based classifier reads the text line by line and decides where each line belongs. It looks for section titles in several spellings and languages (for example "ingredientes", "lista de ingredientes", "preparación", "pasos", "como hacer", "instructions") and groups the lines that follow into ingredients or steps.
4. The result pre-fills the recipe form, and the user reviews and edits it before saving.

I first tried Amazon Rekognition, but it read screenshots poorly and did not cover the whole image, so I switched to Google Vision API. Accuracy also improved noticeably when a recipe was uploaded as several images split by section, so the app supports both one image and several.

**From a URL**

1. The frontend sends the URL to the backend.
2. Jsoup downloads the page. Many sites block automated requests, so the request sends realistic browser headers, follows redirects and uses a timeout.
3. The backend checks that the page is readable (it detects anti-bot and "enable JavaScript" pages) and extracts title, description, ingredients, steps and main image with generic methods, since every site has its own HTML structure.
4. If a page cannot be processed, the user gets a clear message and is pointed to the image import as an alternative.

## Run it locally

**Requirements:** Java 17, Node.js 20+ (developed with v24.22.1), Docker (or a local MySQL instance), a Google Cloud project with the Vision API enabled, and a Cloudinary account.

Repositories:
- Frontend: https://github.com/lorakrasimi/comeycalla-frontend
- Backend: https://github.com/lorakrasimi/comeycalla-backend

1. **Clone both repositories.**

2. **Database**
   - **With Docker** (from the backend repository):
     ```bash
     docker compose up -d
     ```
     This starts MySQL on port `3307` with the default credentials the backend already expects (database `comeycalla`, user `comeycalla_user`). Then run the [schema script](https://github.com/lorakrasimi/comeycalla-backend/blob/main/src/main/resources/schema.sql)..
   - **Without Docker:** use a local MySQL instance, run the same schema script, and point the backend to it using the environment variables `DB_URL`, `DB_USERNAME` and `DB_PASSWORD`.

   The datasource in `application.properties` reads those variables and falls back to the local Docker defaults:
   ```properties
   spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3307/comeycalla?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
   spring.datasource.username=${DB_USERNAME:comeycalla_user}
   spring.datasource.password=${DB_PASSWORD:comeycalla_pass}
   ```

3. **Google Vision credentials (required for image import)**
   1. In Google Cloud, enable the **Cloud Vision API** and create a **service account**.
   2. Create a JSON key for it and download it.
   3. Save it in the backend as `src/main/resources/google-credentials.json`.

   > This file contains private keys. It is listed in `.gitignore` and must **never** be committed.

   Without this file the backend cannot reach Google Vision, so recipe import from images will not work. Manual creation and URL import do not need it.

4. **Other backend configuration:** `[JWT secret]` and `[credenciales de Cloudinary]` (cloud name, API key and API secret), set as environment variables or in `application.properties`.

5. **Run the backend**
   ```bash
   cd comeycalla-backend
   mvnw.cmd spring-boot:run  # Windows
   chmod +x mvnw      # Linux / macOS only
   ./mvnw spring-boot:run
   ```
   The API runs at `http://localhost:8080`.

6. **Frontend**
   ```bash
   cd comeycalla-frontend
   npm install
   ng serve
   ```
   The API URL is configured in src/environments/environment.ts (default http://localhost:8080/api)
   
## Known limitations

- OCR import works well on many recipes, but accuracy depends on image quality and on how the text is laid out.
- URL import fails on some sites with complex HTML or anti-bot protection.
- The shopping list groups ingredients by food category, but it does not add up quantities yet, and some ingredients are hard to classify automatically.
- No automated tests yet.

## Roadmap

- [ ] Quantity field for ingredients, so the shopping list can merge and sum them
- [ ] Better classification of recipe sections (candidate for AI-assisted parsing)
- [ ] Automatic logout when the JWT expires
- [ ] More customizable filters and favorite categories in the user profile
- [ ] Seasonal ingredients section on the dashboard
- [ ] Unit and integration tests

## Author

**Lora Krasimirova Adova** · [LinkedIn](https://www.linkedin.com/in/lora-krasimirova-adova-380500127/) · loraadova@gmail.com
