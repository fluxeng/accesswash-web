/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#eff6ff',
            100: '#dbeafe', 
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#4285F4', // AccessWash primary
            600: '#1565C0', // AccessWash primary dark
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a', // AccessWash secondary
          },
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937', // AccessWash text
            900: '#111827',
          },
          success: {
            50: '#ecfdf5',
            500: '#10b981',
            600: '#059669',
          },
          warning: {
            50: '#fffbeb',
            500: '#f59e0b',
            600: '#d97706',
          },
          error: {
            50: '#fef2f2',
            500: '#ef4444',
            600: '#dc2626',
          }
        },
        fontFamily: {
          sans: [
            '-apple-system', 
            'BlinkMacSystemFont', 
            'Segoe UI', 
            'Roboto', 
            'Oxygen', 
            'Ubuntu', 
            'Cantarell', 
            'Fira Sans', 
            'Droid Sans', 
            'Helvetica Neue', 
            'sans-serif'
          ],
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        },
        borderRadius: {
          'xl': '1rem',
        },
        boxShadow: {
          'soft': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          'medium': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }
      },
    },
    plugins: [],
  }