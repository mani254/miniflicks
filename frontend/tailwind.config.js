/** @type {import('tailwindcss').Config} */
export default {
   content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
      extend: {
         fontFamily: {
            author: 'Author',
            jokerman: 'Jokerman',
            ks: 'Kaushan_Script',
            js: 'Josefin_Sans'
         },
         colors: {
            logo: ({ opacityValue }) => `rgba(50, 107, 159, ${opacityValue || 1})`,
            primary: ({ opacityValue }) => `rgba(100, 97, 174, ${opacityValue || 1})`,
            secondary: ({ opacityValue }) => `rgba(199, 121, 211, ${opacityValue || 1})`,
            tertiary: ({ opacityValue }) => `rgba(213, 208, 255, ${opacityValue || 1})`,
            fourth: ({ opacityValue }) => `rgba(255, 224, 252, ${opacityValue || 1})`,
            bright: ({ opacityValue }) => `rgba(250, 248, 252, ${opacityValue || 1})`,
            dark: ({ opacityValue }) => `rgba(45, 45, 45, ${opacityValue || 1})`,
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


