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
            author: 'Author'
         },
         colors: {
            logo: ({ opacityValue }) => `rgba(0, 64, 80, ${opacityValue})`,
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
            lg: '24px',
            xl: '32px',
            '2xl': '48px',
            '3xl': '58px',
            '4xl': '96px'
         },
      },
   },
   plugins: [],
}


