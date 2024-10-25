/** @type {import('tailwindcss').Config} */
export default {
   content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
      extend: {
         fontFamily: {
            manrope: 'Manrope',
            author: 'Author',
            jokerman: 'Jokerman'
         },
         colors: {
            logo: ({ opacityValue }) => `rgba(50, 107, 159, ${opacityValue})`,
            primary: 'rgb(100, 97, 174)',
            secondary: 'rgb(199, 121, 211)',
            tertiary: ' rgb(213, 208, 255)',
            fourth: ' rgb(255, 224, 252)',
            bright: '#faf8fc',
            dark: 'rgb(45,45,45)',
            "gradient-primary": "linear-gradient(to right, rgb(100, 97, 174) 0%, rgb(199, 121, 211) 100%)"
         },
         container: {
            center: true,
            padding: {
               DEFAULT: '1rem',
            }
         },
         screens: {
            '2xl': '1430px',
            '3xl': '1560px'
         },
         fontSize: {
            xs: '15px',
            sm: '17px',
            md: '20px',
            lg: '22px',
            xl: '26px',
            '2xl': '48px',
            '3xl': '58px',
            '4xl': '96px'
         },
      },
   },
   plugins: [],
}


