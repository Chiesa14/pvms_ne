const config = {
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366F1', // Indigo 500
                    light: '#A5B4FC',
                    dark: '#4F46E5',
                },
                secondary: '#14B8A6', // Teal
                accent: '#10B981', // Emerald
                background: '#F9FAFB', // Gray
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
export default config
