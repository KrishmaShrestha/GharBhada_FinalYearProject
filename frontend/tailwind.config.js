/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2C5EBA',
                    50: '#EEF3FC',
                    100: '#D4E2F8',
                    200: '#A9C5F1',
                    300: '#7EA8EA',
                    400: '#538BE3',
                    500: '#2C5EBA',
                    600: '#1F3A60',
                    700: '#1A3152',
                    800: '#152744',
                    900: '#101D36',
                },
                secondary: {
                    DEFAULT: '#1F3A60',
                    50: '#E8EDF4',
                    100: '#D1DBE9',
                    200: '#A3B7D3',
                    300: '#7593BD',
                    400: '#476FA7',
                    500: '#1F3A60',
                    600: '#192E4D',
                    700: '#13233A',
                    800: '#0D1727',
                    900: '#070C14',
                },
                accent: {
                    DEFAULT: '#F8C146',
                    50: '#FEF8E7',
                    100: '#FDF1CF',
                    200: '#FBE39F',
                    300: '#F9D56F',
                    400: '#F7C73F',
                    500: '#F8C146',
                    600: '#E6A82E',
                    700: '#C68F27',
                    800: '#A67620',
                    900: '#865D19',
                },
                success: '#2ECC71',
                warning: '#F39C12',
                error: '#E74C3C',
                info: '#3498DB',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'primary': '0 4px 14px 0 rgba(44, 94, 186, 0.2)',
                'accent': '0 4px 14px 0 rgba(248, 193, 70, 0.3)',
            },
        },
    },
    plugins: [],
}
