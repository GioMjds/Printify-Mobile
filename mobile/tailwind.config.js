/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './index.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				'primary': '#0e2148',
				'secondary': '#483aa0',
				'accent': '#7965c1',
				'highlight': '#e3d095',

				'background': '#F9F5F0',
			},
			fontFamily: {
                'lexend-thin': ['Lexend_100Thin'],
                'lexend-extralight': ['Lexend_200ExtraLight'],
                'lexend-light': ['Lexend_300Light'],
                lexend: ['Lexend_400Regular'],
                'lexend-medium': ['Lexend_500Medium'],
                'lexend-semibold': ['Lexend_600SemiBold'],
                'lexend-bold': ['Lexend_700Bold'],
                'lexend-extrabold': ['Lexend_800ExtraBold'],
                'lexend-black': ['Lexend_900Black'],
			},
		},
	},
	plugins: [],
};