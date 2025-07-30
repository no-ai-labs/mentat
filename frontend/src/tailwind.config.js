/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./src/**/*.css"
    ],
    theme: {
        extend: {
            borderWidth: {
                '3': '3px',
            },
            boxShadow: {
                'block': '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'block-hover': '0 0 0 3px rgba(59, 130, 246, 0.5), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
}
