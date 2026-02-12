import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],

    darkMode: 'media',

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Brand colors - references CSS variables from app.css
                brand: {
                    DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
                    hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
                    secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
                    accent: 'rgb(var(--color-accent) / <alpha-value>)',
                },
                // Theme-aware colors
                theme: {
                    page: 'rgb(var(--color-bg-page) / <alpha-value>)',
                    surface: 'rgb(var(--color-bg-surface) / <alpha-value>)',
                    elevated: 'rgb(var(--color-bg-elevated) / <alpha-value>)',
                    border: 'rgb(var(--color-border) / <alpha-value>)',
                    'border-hover': 'rgb(var(--color-border-hover) / <alpha-value>)',
                },
                content: {
                    primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
                    muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
                },
            },
        },
    },

    plugins: [forms],
};
