# ONLY HELIO - بوابة عقارية متكاملة

## 🌟 Overview

**ONLY HELIO** is not just a real estate listing website; it is a comprehensive digital ecosystem designed specifically for the city of **New Heliopolis**. The core vision is to create a one-stop platform that serves every need of individuals, investors, and businesses within this promising city. It covers the entire user journey, from finding the perfect home to handling finishing, interior design, and decoration.

The platform aims to be the primary and most trusted digital destination for modern living in New Heliopolis.

---

## ✨ Key Features

The platform is divided into three main user experiences:

### 1. For Public Users & Property Seekers

-   **Smart Property Search:**
    -   **Advanced Filters:** Dozens of precise criteria (property type, finishing status, price, installments, etc.).
    -   **AI-Powered Natural Language Search:** Users can type what they're looking for in plain language (e.g., "3-bedroom apartment, fully finished, for 2 million EGP"), and the Gemini-powered system automatically applies the correct filters.
    -   **Multiple Views:** Results can be displayed as a grid, a list, or on an interactive map.

-   **Integrated Post-Purchase Services:**
    -   **Finishing Packages:** Pre-defined finishing and interior design packages with clear pricing.
    -   **Exclusive Decorations:** A gallery of exclusive artworks like wall sculptures and paintings, with options for custom orders.

-   **Rich & Professional User Experience:**
    -   **Favorites System:** Save properties, projects, and services to a personal list.
    -   **Performance Optimized:** Utilizes modern web technologies like lazy loading and WebP image formats for ultra-fast page loads.
    -   **Micro-interactions:** Subtle animations and visual feedback on user interactions make the site feel more professional and alive.

### 2. For Partners (Developers, Agencies, Finishing Companies)

-   **Dedicated Partner Dashboard:** A powerful control panel to manage all business activities.
-   **Full Content Management:**
    -   Developers can add and manage their projects and available units.
    -   Finishing/Decoration companies can build a professional portfolio.
    -   Agencies can manage their property listings.
-   **Advanced Lead Management:**
    -   Receive and track customer inquiries directly within the dashboard.
    -   Update lead status (New, Contacted, Completed, etc.) and add internal notes.

### 3. For Site Administrators

-   **Comprehensive Super Admin Dashboard:** A central control room for the entire platform.
-   **User & Partner Management:**
    -   Approve/reject new partner applications.
    -   Manage account statuses (active, disabled).
    -   **Bulk Actions:** Apply a single action (e.g., activate, delete) to multiple partners at once.
-   **Advanced Analytics & Reporting:**
    -   In-depth dashboards showing user growth, property performance, and lead conversion rates.
    -   Custom report generation and export (CSV, PDF).
-   **Full Site Content Management:**
    -   Directly edit most of the public-facing content (hero section text/images, services, testimonials, banners, etc.) from the dashboard.
-   **System Configuration:**
    -   Manage property filters, subscription plans, and automated request routing rules.

---

## 💻 Tech Stack

-   **Frontend:** [React](https://reactjs.org/) (with TypeScript)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Data Fetching & State Management:** [Tanstack Query (React Query)](https://tanstack.com/query)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **AI Features:** [Google Gemini API](https://ai.google.dev/gemini-api)
-   **Forms:** [React Hook Form](https://react-hook-form.com/)
-   **Charting:** [Chart.js](https://www.chartjs.org/)
-   **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)

---

## 📂 Project Structure

The project follows a feature-based directory structure to keep the codebase organized, scalable, and easy to navigate.

-   `src/components/`: Contains all React components, organized by feature or domain.
    -   `admin/`: Components for the super admin dashboard.
    -   `auth/`: Authentication components (Login, Register, context).
    -   `partner-dashboard/`: Components for the partner dashboard.
    -   `properties/`: Components related to property listings and details.
    -   `shared/`: Reusable components shared across multiple features (e.g., Layouts, Modals, SEO).
    -   `ui/`: Generic, low-level UI components (e.g., Button, Card, Input).
-   `src/services/`: Contains all API-related logic, simulating a backend. Each file corresponds to a data entity (e.g., `properties.ts`, `partners.ts`).
-   `src/data/`: Holds the mock database files (e.g., `propertiesData`, `partnersData`).
-   `src/hooks/`: Custom React hooks for shared logic, primarily for data fetching with Tanstack Query.
-   `src/types.ts`: Centralized TypeScript type definitions.
-   `src/utils/`: Utility functions.
