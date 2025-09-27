/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './apps/**/*.{html,js,ts,jsx,tsx}',
        './sites/**/*.{html,js,ts,jsx,tsx}',
        './cortex/**/*.{html,j2,js,ts,jsx,tsx}',
        './resources/**/*.{html,j2,js,ts,jsx,tsx}',
    ],
    darkMode: 'class', // Enable dark mode with the 'dark' class
    theme: {
        extend: {
            borderRadius: {
                DEFAULT: 'var(--radius)',
            },
          fontFamily: {
            sans: ['Inter', 'sans-serif'], // Add custom font
          },
          colors: {
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            card: 'hsl(var(--card))',
            'card-foreground': 'hsl(var(--card-foreground))',
            accent: 'hsl(var(--accent))',
            'accent-foreground': 'hsl(var(--accent-foreground))',
            border: 'hsl(var(--border))',
            muted: 'hsl(var(--muted))',
            'muted-foreground': 'hsl(var(--muted-foreground))',
          },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}