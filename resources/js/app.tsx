import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { hydrateRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Storeflex';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx')
        ),
    setup({ el, App, props }) {
        hydrateRoot(el, <App {...props} />);
    },
    progress: {
        color: '#86efac',
    },
});
