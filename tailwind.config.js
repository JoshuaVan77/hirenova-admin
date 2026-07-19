/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e1a',        // Deep Navy Black
          card: '#111827',      // Dark Gray-Blue
          input: '#1f2937',     // Input field
          sidebar: '#0f172a',   // Sidebar background
        },
        brand: {
          primary: '#1e3a8a',   // Dark Blue
          secondary: '#3b82f6', // Bright Blue
          accent: '#06b6d4',    // Cyan
        }
      }
    },
  },
  plugins: [],
}