import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-outfit)', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#A3D921', // Lime green
                    dark: '#88B61C',
                    light: '#C5E86C',
                },
                secondary: {
                    DEFAULT: '#111827', // Dark gray
                },
                accent: {
                    DEFAULT: '#FFD166', // Sunny yellow
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};
export default config;
