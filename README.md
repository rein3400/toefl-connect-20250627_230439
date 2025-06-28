```markdown
# TOEFL Connect (toefl-connect-20250627_230439)

A mobile-first, accessible, responsive static website for TOEFL preparation.  
Built with semantic HTML5, modular CSS, and ES6 JavaScript modules.  
Hosted via CDN (Netlify/Vercel) with serverless functions for order processing and email notifications.

Project specification:  
https://docs.google.com/document/d/1iUZ-J9fNDWy6vewrlJ4xrUHYe4EnEF6fb-R-tWu-vLo/

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Installation](#installation)  
4. [Usage](#usage)  
5. [Project Structure](#project-structure)  
6. [Components](#components)  
7. [Dependencies](#dependencies)  
8. [CI/CD & Workflow](#cicd--workflow)  
9. [Contributing](#contributing)  
10. [License](#license)

---

## Overview

TOEFL Connect delivers:

- A **digital PDF store** with topic & level filters.  
- A **mentoring booking** system with calendar integration and secure checkout.  
- **Embedded test simulations** via Google Forms.  
- An **educational blog** with pagination and social sharing.  
- A **contact portal** for student-mentor inquiries.  

All functionality initializes in `app.js` (type="module") on `DOMContentLoaded`.  
Serverless functions (`functions/processOrder.js`, `functions/sendConfirmationEmail.js`) handle orders and email notifications.  
No-JavaScript fallbacks ensure core content accessibility. SEO-friendly meta tags and dynamic titles are defined in `index.html`.

---

## Features

- Responsive top navigation (Home, TOEFL ITP, TOEFL iBT, Kursus, Blog, Kontak Kami)  
- Accessible skip-link, visible focus styles, ARIA landmarks  
- Custom color palette (white, #e97311, #1a1a1a) with WCAG 2.1 AA compliance  
- PDF store with ?Add to Cart? UI & shopping cart drawer/modal  
- Secure checkout flow via serverless functions  
- Mentoring package catalog & datetime picker for bookings  
- Google Forms embed for test simulations  
- Blog listing with pagination & social sharing  
- Contact page with mentor profiles & inquiry form  
- Client-side ARIA-compliant form validation  
- Performance optimizations: code splitting, lazy loading, image optimization  
- Analytics via Google Analytics & Tag Manager  
- SEO-friendly meta tags and dynamic `document.title`

---

## Installation

### Prerequisites

- Node.js (for tooling & Netlify CLI)  
- Netlify CLI (optional, for local dev):  
  ```bash
  npm install -g netlify-cli
  ```
- Copy environment variables:  
  ```bash
  cp .env.example .env
  # then edit .env with your API keys and site ID
  ```

### Clone & Serve

```bash
git clone https://github.com/yourusername/toefl-connect-20250627_230439.git
cd toefl-connect-20250627_230439

# Run locally with Netlify (emulates serverless functions)
netlify dev

# Or serve static files only
npm install -g serve
serve .
```

---

## Usage

- Open your browser at `http://localhost:8888` (Netlify) or the port reported by `serve`.  
- Navigate via the top menu to access Store, Booking, Blog, Simulations, and Contact.  
- Interact with UI components ? modals, alerts, pagination, date/time pickers, cart drawer.

### Environment Variables

```ini
# .env
NETLIFY_SITE_ID=your-site-id
API_BASE_URL=https://your-cdn-url/
EMAIL_FUNCTION_URL="/.netlify/functions/sendConfirmationEmail"
ORDER_FUNCTION_URL="/.netlify/functions/processOrder"
```

### Linting & Formatting

```bash
# Run ESLint
npx eslint "**/*.{js,css}"

# Run Prettier
npx prettier --check "**/*.{js,css,html,json}"
```

---

## Project Structure

```
.
??? index.html
??? css/
?   ??? base.css
?   ??? layout.css
?   ??? components.css
?   ??? utilities.css
?   ??? pages.css
??? js/
?   ??? app.js
?   ??? uicomponents.js
?   ??? datetimepickercomponent.js
?   ??? paginationcomponent.js
?   ??? socialsharecomponent.js
?   ??? apiservice.js
?   ??? analyticsservice.js
?   ??? formvalidator.js
?   ??? storemodule.js
?   ??? cartmodule.js
?   ??? bookingmodule.js
?   ??? simulationmodule.js
?   ??? blogmodule.js
?   ??? contactmodule.js
??? assets/
?   ??? data/
?       ??? products.json
?       ??? packages.json
?       ??? blogPosts.json
?       ??? mentors.json
??? functions/
?   ??? processOrder.js
?   ??? sendConfirmationEmail.js
??? .env
??? netlify.toml
??? .eslintrc.json
??? .prettierrc
```

---

## Components

Below is a list of all components, their file types and purposes:

- **uiComponentLibrary (.js)** ? Reusable UI elements: buttons, modals, alerts, spinners.  
- **serverlessJsonClient (.js)** ? Wrapper for fetch/post operations to JSON data and serverless endpoints.  
- **ariaFormValidator (.js)** ? Validates form inputs and displays ARIA-compliant error messages.  
- **renderInteractivePdfListing (.js)** ? Renders PDF product listings, filters by topic/level, handles Add to Cart.  
- **cartUICheckoutManager (.js)** ? Manages cart state, renders cart UI, initiates checkout.  
- **mentoringBookingFlow (.js)** ? Handles mentoring package booking form and payment flow.  
- **insertFloatingCtaForm (.js)** ? Inserts floating CTA button and embeds Google Form iframe.  
- **fetchAndRenderBlogPosts (.js)** ? Fetches and renders blog post listings and detail views.  
- **contactFormManager (.js)** ? Manages contact form, mentor selection, and form submission.  
- **googleAnalyticsTracker (.js)** ? Initializes Google Analytics and tracks pageviews/events.  
- **bookingDateTimePicker (.js)** ? Reusable date/time picker UI component for booking forms.  
- **paginateListComponent (.js)** ? UI component to paginate long lists (blog & store).  
- **renderSocialShareButtons (.js)** ? Renders social media sharing buttons for blog posts and resources.  
- **index (.html)** ? Main landing page.  

**Placeholder / auxiliary files** (added during plan confirmation):  
- appendMissingAiFile.js  
- highlightAddedFile.css  
- showMissingAiFile.css  
- missingFileNotification.css  
- addMissingFileStyles.css  
- confirmMissingFileStyles.css  
- addMissingAiFile.js  
- addMissingAiFiles.js  
- addMissingAiFile.json  
- recordMissingFile.json  
- addedAiFiles.json  
- aiMissingFiles.json  
- addAiListedFile.txt

---

## Dependencies

- Native ES6-compatible browser (modules, fetch API)  
- Node.js & npm (for tooling)  
- Netlify CLI (optional, for local dev)  
- ESLint & Prettier (dev)  

---

## CI/CD & Workflow

- **Git Flow**: Protect `main`, use feature branches & pull requests.  
- **Lint on Commit**: Enforce ESLint & Prettier on `.js` and `.css`.  
- **CI Pipeline**: On each push, run lint checks and (optional) build step.  
- **Deployment**: Push to Netlify or Vercel; environment variables secured in build settings.  

---

## Contributing

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/my-feature`).  
3. Commit changes (`git commit -m "feat: add XYZ"`).  
4. Push to your fork and open a Pull Request.  
5. Ensure all linting passes and no console errors occur.  

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
```