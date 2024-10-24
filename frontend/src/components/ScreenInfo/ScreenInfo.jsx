import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/autoplay";

import { star } from "../../utils";

const images = [
	"https://img.freepik.com/free-photo/winsome-young-woman-playfully-touching-her-sunglasses-indoor-portrait-happy-curly-girl-isolated-purple_197531-10844.jpg?uid=R150192097&ga=GA1.1.1891343504.1699286121&semt=ais_hybrid",
	"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTERUSExMWFRUXFRcXFxgXGBUXGRcWFxUWFxcZFRcYHSggGBolHRYYITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0mICUyLS0vLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLf/AABEIALcBFAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYDBAcCAf/EAEIQAAIBAgMFBQQHBgUEAwAAAAECAAMRBBIhBQYxQVETImFxgTKRobEHI0JSwdHwFGJykrLhJDOCwvEVJaOzFmNz/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAECAwQF/8QAJxEBAQACAgICAQIHAAAAAAAAAAECEQMxEiEEQSIyQhNRYXGBofD/2gAMAwEAAhEDEQA/AL/ERAREQEREBET47gAk6AC5geK9ZUUs7BQOZlT2xv8AUaRyorOevAfOa++mJqGmH1sb5R08T08T6cxOdmidahubcWPE+Q5fOTjNtPDS/Lv9UYDJRX/UflYzPhvpAGfLUoFfEN+Y1985S+NfN7R9/Lxkrg3FVcl7k+ze5yt4eBlvFGo7fgcdTrLmptf5jzHKbM4lsDalWjU0YhgbDmPEEDiJ1rYu2Ur0s9wpXRwT7J/IytmkWJOJC4zeWkpsoLnw0HvM16O9Sk95CB4G8hVYomrgto06vsNc9Oc2oCIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICVvfHaeRVpD7Xeb+G9gPU/KWSUDeGuDinZvZUhQOpAt87mRa04sd1MV6YrUaakC9rsPjr+ushd4N3l/Z70QS3E8APPwGn4SLx+8PeCpwHteJt7N+nWZ8LvTUYhQC5OgUAXPgBwtGrPbo9X0oeMwOS9zw4/8z1sjFlXAA0986xsr6P8A9pJrYvuDitJTw/jbmZI//G8NQFkpjzOspn8qSdGPBu9uSbXWoHFRRa+twNP7SR2XtkFgDZWIAax7rjkfBh8dZddrYVWFso905nvdh+xqoy6XMcXLOT1ezl4vCbXYmeZH7GxvaUgeY0PmJvXmjjZKVUqQymxHMS1bE2+HslTRuR5H+8qN4BgdOiQu7m1e1XI3tqPeOsmoCIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgJxvezHk4moq/ZZtOrEzsk5DgtmHEbQenoS1SpYNe2ilheVyuptvwTd0r2A2fXqsFWi+bMoOZSMpbgTf39J3DdTdOlhaamwepbvOevh0E0sBs1lWk1WxrLdKjaXsL2BI6aD0llw1HMO6xB46H9fG85OTnufp2ZcXhO2LaG3UoDWnWbxWmxA9TaVivvThqlwHyG/BwU+ehkP9Ju3cVhUIV3BqHKpBHdUXLsAouDqoufvHpOM4avUaqDnbMTqSxuddbknX1l+Pg/iY7Z3knFdd2u44yoBqTpac539xFOooyHMVYXI4Dla8nNoVFalRpq5pZwiMwXOAzErfLmGVTYcDbXpKbWxemVcuXlmVGv8AvHMDqfCX+Pxfls+Tyamm9uZidWT190tuaVXd/DXBxCgKocIwGl6huO6v3SrgnoR6SyBp059uGs159mINPYMqhs4SuyOGQ2I4flOi0GJVSeNhfzlE2BRz10B4an3CX+AiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIAzk299KrhsU9WjcVBVStT8b/MXDAzraqTwnhtnqaiVGUF6ZORuYzKQdeljwmeecx7b8Mu/wCjHg8V21NHy2DorjjoSAbW9ZlpMUMWy8ORPzmwwDC4nn6ehvXr6V7ffd8Y+iAGy1EN1J4ajUHwP4Cc6wX0a1nYpUFPQEjKSSxHAA2Fr9T7p11my8ZD1dtYVe81VbXPvGhmmHJnPUWnFL9baG82w0pYClR07g16lrXa1/Kw6ADpON7QwRptlZ063zDh1y+16Wl83k3gpNnyOMiksEHIWA16m95zZnaq1Sq3P/gCdnxplN7cnypPUvaQ2VVBqgLfKqEC/M3zE25Xy+4CWoPKjsSg3ag2Ngv4WlnV5tn24703FaZVM1EaZ0aVVWbcxL1mPRPmRLnKruPRNqj8jZR6XJ+YlqgIiICIiAiIgIiICIiAiIgIiICIiAiIgIia1fFgX14RsbMw1cSqtZiF0uCTYacZENtBi/Zsch4qeIYfrl+YvpbQrGvTqJYirTbKyceOqMvVW/PmJW5LzHdXaitlHjrPFSpYGbDDSUvfTbLUiFQ5e7mJ8NfynFllu7d/Fx79RvYLa61DWUHvU6gBHgygg+8N7pmfEsnfXVTxH5Tlf0cbZz7QrZmstdSBfmUtk9bBvfOobNq5yyn7JtKcuFwy03xsym5036NdawuDr0le3rwdUUmKFLWuQeclcVs8E3QlW6jSRG3MDWZAna/WPdUzDu3ClzmA8FPqRIwysy9LY5+H5SuN7w4sluy07ts1gB5D9eEwYSncW5aSxVd1atBmasvaOTplObzJIF5t7P3erVdcgRLau5Coo69T5T1PKSajzsrc8rlki8BopbroPx+U2qbyyNu5S7qBXKqtmqFsmYnW6Jrw4WI/MxO0tjNR7ynMnXgV/iHTxHwlWGfusdMzYSalEzcpoenHhJUXncerei69H+YEsc1NmYJaVNVUAaC/ibakzbgIiICIiAiIgIiICIiAiIgIiICIiAiIgfHOh8pAVywJI18CbX8pPVOB8jINkJlati0cSVdLG4sefFG5W/LUEE2PKedjVf8AF0DxLZ6T87hR2i+fDTw9Z6xqBhqNR+tDy+U190irY3KTqqmoBzuAyN6fWA+Z8ZTL9Na4z26ITOSfS2TZ7cwg9Lm4+HxnWTOY/SZTzZh+6P6xObG/nHZh1l/ZyrZeJFF0ctl149LEWPh/adw3CxJqrVJ1IK69bicY3ZwbGo1QjMUOUX1s3O06hvPvFajhjhqzU6vYHt1XQnIcqFzY6nK3mPSX5r58vhOzHeHD5/V/7/a9bQxdPD0zVrNlUW14kk8AANST0molSliDTr0znRad1IOnfUXNuttPf1ljrbPo18MEZRVpui6tY5gVFmv153nGsLgamHqYgqan1IquWZSoqmmKnZkH7a3Abn8dY4+KX71Y57zb+lh2ltmjSrikL1MQ2i0l1bzY8EW2tzy6zJjnZOzaoQ1SpUWnTUf5aE8WA4sQAe8ddNAtzNDcjYa06f7U12r11DMzcQrd7KPPQk8z5Cet4q/+OwVP7rk6eItr+fiJ1am9RhtLvQFzb18+cjMTS1vy1BHgePwkj296hUcBqfM8J4xdLQyEqPj8F2dRsoOQW/034en689zZeJUvSD2CKRc+Ga+vrJU2V6rHgq0z4E9/TjroRpI3EUQ6GsoC2qMjBRYHQEEDzNvUS21LHTEcEAggg8CNQZ6nPNhbYagbA5qZIzL00a5Xx09ZfqNcOoZTdSLgyVWWJ8i8D7E+Ez6ICIiAiIgIiICIiAiIgIiICIiB5qNYEmQvaWNxJmst1I8JFGncGVq2LFUpXF+M8br4BUxLMmg7Nrrbqy2seQ0OnjPTO1rCSO7mGIDuxuWIA8l/ufhMuS6xb8c9pqqdJzX6QDct/wDm3w1nRsS2k5/vhTzNbqrL7xOaX3HZh1VI2diXpXNMqM47wKhgTyOvA8dZHYHC4mpVqDvuzN9kEk9O6CANPCZadX6tTOqfRbQ+oqVPvOF9FW/+6dEy/h5XLXtjlj54SbTm62HrYbApSr1CSASRcdwHggI6efEm2lpFHFdrWP3bZQOWXp7r++b23sdc9mp05+JkVgV7/lGGP7qwzs6iRw4yrl+4APQDun3W9byh1cYKm16Yv7L2/lps3rwl4xT5QWAOgN7C5I46DnY/Mzl+6b9rtIVOY7V//G6/7pvhO6zq67FxGerW8KhHuA/XpJXFHQ/rjKzulV+urj/7DLFj6llJAueAHUnQSt7SgNokMcvK92HXTuj4zSxm1KdO1AXJW+YKARmc318rj3T7tDGdjRJT6ys1Q01tw7VjfTra490+bG2ClNbvao51dm1ueJtflLfXtDUQ5dD7/ePxMse7G2ezbsnPcbgT9ljp7j85GYuj2gapopFyo5ZBe3qdSPC3WRyGTFLNOtWi0p26+3SpFKq3cOisfsnoT0+UuUIfCJ81vPUQEREBERAREQEREBERAREQERED4w0PlIiu12Cj1kwRK5tCq1OrTXhmcZvLlbzkVbFj25iCirTpuFdza9izAc+zQDvN52AvflaWrZeDFGilMXOUakm5JOpJPMkkyq/9O7SqHa+YsvA5QlIG+W/EljqQOPMgcbq05uX+Tp4umpjW0lH3obvKfGXTHyj726ZfOYzt1Y+o5riGAXLe1quX42/CdQ+j/bd6Aw9MDuKzVGN73Zjly8rW5/umcg2rqr25VTb+Yj8Z0/6LqNsPWqHiXVPREv8A7zPQy48bjuuG8tl8U1jHGYnnNzZ1Pu35mU/bm9uFSpYVM5HEUxm16ZvZ+M2sDiquMpZ3Bo4c3sgP1lZeF3Yewngup620NfG6U2096t8bl6GHIIAIqVR8Vp/It5gdZWtw2f8AbMykBVpuahPAJpfy1yzNvKVByIqqqqQAoAHHw8ph3cGXBYuoOLPSpeguze/MPdNJJMRYdnYgU8aCD3Kx7p5X/vJbfLaT0qGWl/m1HWmnmxtf4yFSj2mFwTDiKi6/wub/ANM2d9MV2Zo1iLilVRmHgb3I8RaU1ujawuxgtamnFMLR0P3q1S+d/Pj/ADSRyDLY8OfiOnr+cy4TGpUU1EIIdRYjgR1nzCoGY3OiDh1a19fIW98i1KG2u7CooBIA1svtMeQH3RbmZjODLC4UK/EqCbEeF+B+EyYJ+2xFQjgul/GZ9oVGp6Uxmc6DwMlGkRw0MtO7e8FrUap04Kx5dA3h4yNxmH+qTOQapPtcPThr6yKIsSD6xtSzTq0SrbvbxCwpVjY8Fc9OQb85aZKCIiAiIgIiICIiAiIgIiICIiAkbtnB5wHHtIQ3mAbmSUQIPZOIDB+8CwdwR0F7L8FHxlnR72PUA++c73hw1TCYlcTSUmg2btrXNsz5r28CxI8Cwlu2DjA5sNVIzKfmPiCPM9JhzY/bp4svpI42npec630fvJ5EzpO0z3NJy3f85AH6I1vhMMZ+Tql/Dbm1YXpO374PvqCTu0trOmATDIcva1KlSoRxKjKirfoSpJ8hINgVwb3450HoNR+P8snd21p1auGaoAykVFAPDtAzOAw5+0PhPU+nnX9T1uZuj2xFWqLUQdBwNTy6L485ftqVwlMgWFhYDhaw0A90ynFZVsBIPazlgb+Hx1mNtyq0in7Ve9z4H+ozLsk/9sqeOKPwpU5r7V9k/wAJ/qMybJb/ALbUHTEk++kv5S/0fa0bluKmFCc6dVrDz734mZd7atLLkqaqws1uIGhBGvEEA+V5CfRxXH7Q9M8GQt6oR+DGetvuGrORrqcvh+tfdKWfkmM2zMR+yHs7DKSTlBubm1guvnfrLNgdoKaqUgNaiVHudL94gi3UDKfKU7B7SenTCIFXjdgozG5P2pk2fistRGa7ZagcEHvA8GsfEXBHMHwi+1fKdJvZWDrq9ZEGUFz3yOA8BzmLau1ey/w+GVq2IYcfu3+07cFm5itqdtTIp5lZmKAMbLwuWOuqhe96dZHYVmFM08CqOb9+q5OrcCxsO8fC/SwtaREtPGYd6VKjTLjMqnO+ayglsx1PEC9us3qdbtLIqMTp9YwK5tLDKCOHieOkxru8pIqVqjVm8TlVW8EFtPOR+0tiUr5sgB6jj7xLekVJCWjdnblrUap7vBWPL90+Eq1EWUa5tBqeN7c5kEhR1KJT92ds5D2VQ9w+yT9k9PIy4QEREBERAREQEREBERAREQEREDzUQMCCAQdCDqCPESslGw1ZOz7qXYW4jjoBrpp85aJFbco3XN0sf7/KRelsbqs2J2ypHjbUcxOY7/bWFVgim4Hw56+N7aeHjLxgKwI7xsw5jpy8xI7be6lCuS3+W51zL7J/iXhfxmWOExy26LzW4+LkmPB7BuhZL+ma3zm/ucMwprzTEhvRlBH/AKjLPvNuouG2dXYP2j3pte1rKHF7C/iT6SqbhVrVnXqob1Vso+DmdW941z39Tp51A62+ZM0cfR5efw4T4+1FQG2tpEYjbt2A6kAnoCZlIuhtuADMP3T+JPzmhset/hMSnQo4/lYH8Jk2q/1rhvESL2TWCCqW9llKAfeYnQD4zSdFTu4ZC9viCdVQUqY/eqak+gX5xVq5mPTh6TSwSdlRsOLWv+uvGZ6Url2pfXpsoJnQTDTEkNmYNqtRaa8WNvLqT5C5kVWe1p3Z2ahoZ3RSWYkZlBNhpoTwGhmbF0m4Aso6A5flLCdlFUC09QoAA4HQe6QG0adRbg3B9RMsc5k3uFx7QdfC21Lt/Mx+ZkdiG5C5m9i6TWJZiFGpk3uhsCnVpmvUU2a4RSeQ0LG3O/DymsUtV+gtgL8eczCbm2cEKNZqam4Fj46i9jNMQzfTOkbOqFqVNja5QHTynN5eN1KhOHF+TEDyvAmIiICIiAiIgIiICIiAiIgIiICa2PXQHmD8+PymzNHa9XLTLHgoJPoJF6TO0bi9n9oL0yEccDyv0IHIz6M6gZ1vprbUf3mzhKmmuhnurVlF0JtWir03ptfJUUqeozAics3U2FiBiqiLTJKBkZvZUNcEd49bA89DOv18Wh0KMfJSw9wE19lpSWq7IrLmykghhfLcAgMPG3oJeZalLHO9oYSqMRVwzVFFVKJqKqqSrvkzmmGLDXLrmtr0HOsJjXY5QpZjwy3JJ8p0T6QKVNMRTxisVqJlJHJwh0HgTfL4gznlHD+yykqygHumx0AN1PUTSX1tOM96WHEbq43EJ2nYFe73sxVSco4hb3vx6SOwi5FAy6jgDy8fOdEw2KoNhqXYYp3Ym7BnUsR9oOLaek08bselXu1zTYDkPjfgROWc93qu2/Glm8VGxeZdDc6hv4c19L+h+My4dryW/wCjVV7RagzAiwPSxuNPxkGqlHyn0/XWazOZdOPl47j7qTpzou4uxCi9s4szjuj7qcb+Z+VvGV/cXYBrv2rj6pDz4O/TxA4n0HWdTsEW8x58/wBsafH49flf8PFesKaylbf2mX7o6zf27tO9xea27+yjUbtXHcB0H3j+Uw48ba6s8phjuvezN2xUpfXlteABsbdTeTuJqphqFwNEUBR1PACbso+9O1e0qdmp7iH3tzPpw987pNPNyy8rtEVqpZizG5JuT4meZ4Bn0GSq2sDhGquEXiePgOZnQ8JhxTRUXgBaQm5+DApmqeLGw8hLDAREQEREBERAREQEREBERAREQEr+/FbLhWH3rJ/OQv4z5EJjcUKKbO3BVJPprITdytVaiKrtfOzOB0RjdB/LaIlIukjXvpex8l/KVHbeMxK4ylTouWyg1XVyArgXuug5j3Gx5REnEVrfwszrWLAoymoFF9E7uXU87MNPGTW7+6dLs0q1CXZlVgOCjMAeWp4xEvldYonaus2Ew+LrI9O9msCC4ZL2N1IPjadG2ViFrUrIgK20OoYi3O8ROTmnVej8fLc09rhcwsR5dZHYnccV3BD5AGF7C5NjZsvQ8RrfkYic8zyxvptyYzKaroWzsGlGkqItlUWA/XE+Mg9tbVJuBoBES3dZ4RE7H2acQ3aP/lqeHNj08BLgigAACwGgHSfInbx4yYvP58rc7Kh96NpGlTyr7b3APQcz5yhmIl2L1TUkgDiTaXXCbs0uyAfV7akHn4RECZwWGFOmqDgotM0RAREQEREBERAREQERED//2Q==",
	"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5oT8v7ERJLV81vgQhW5f_-kon4CNV9hUexQ&s",
	"https://img.freepik.com/free-photo/winsome-young-woman-playfully-touching-her-sunglasses-indoor-portrait-happy-curly-girl-isolated-purple_197531-10844.jpg?uid=R150192097&ga=GA1.1.1891343504.1699286121&semt=ais_hybrid",
	"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5oT8v7ERJLV81vgQhW5f_-kon4CNV9hUexQ&s",
];

const screen = {
	name: "Screen-1",
	minPeople: "5",
	capacity: "8",
	description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer.",
	specifications: ["This is the specification-1 text of the printing Lorem Ipsum has been the industry", "This is the specification-2 Lorem Ipsum has been the industry's", "this is the third and 4th specification", "This is the specification-2 Lorem Ipsum has been the industry's"],
	extraPersonPrice: 100,
};

function ScreenInfo() {
	const [thumbsSwiper, setThumbsSwiper] = useState(null);

	return (
		<div>
			<div className="swiper-1 mt-3 w-full m-auto relative">
				<Swiper
					spaceBetween={10}
					slidesPerView={1}
					navigation={{
						nextEl: ".custom-next",
						prevEl: ".custom-prev",
					}}
					thumbs={{ swiper: thumbsSwiper }}
					autoplay={{ delay: 3000, disableOnInteraction: false }}
					modules={[Navigation, Thumbs, Autoplay]}
					loop={true}>
					{images.map((img, index) => (
						<SwiperSlide key={index}>
							<img src={img} alt={`Slide ${index + 1}`} className="w-full object-cover" />
						</SwiperSlide>
					))}
				</Swiper>
				<div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
					<button className="custom-prev w-9 h-9 bg-bright flex items-center justify-center rounded-full">
						<div className="icon">
							<FaAngleLeft className="text-lg" />
						</div>
					</button>
				</div>
				<div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
					<button className="custom-next w-9 h-9 bg-bright flex items-center justify-center rounded-full">
						<div className="icon">
							<FaAngleRight className="text-lg" />
						</div>
					</button>
				</div>
			</div>

			<div className="swiper-thumbs mt-2  w-full max-w-[95%] m-auto">
				<Swiper onSwiper={setThumbsSwiper} spaceBetween={10} slidesPerView={4} freeMode={true} watchSlidesProgress={true} modules={[Thumbs]}>
					{images.map((img, index) => (
						<SwiperSlide key={index}>
							<img src={img} alt={`Thumbnail ${index + 1}`} className="w-full object-cover cursor-pointer" />
						</SwiperSlide>
					))}
				</Swiper>
			</div>

			<div className="screen-content mt-4">
				<div className="flex items-center gap-5">
					<div className="w-full h-[2px] bg-bright"></div>
					<h2 className="whitespace-nowrap">{screen.name}</h2>
					<div className="w-full h-[2px] bg-bright"></div>
				</div>
				<p className="mt-3">{screen.description}</p>
				<div className="flex gap-x-3 items-center mt-3 flex-wrap">
					<BsFillPeopleFill />
					<p className="whitespace-nowrap">Capacity: {screen.capacity} people</p>
					<p>
						* Additional charge of {screen.extraPersonPrice} per person for any number exceeding {screen.minPeople} people
					</p>
				</div>

				<div className="mt-3">
					<h4>Features</h4>
					<ul className="">
						{screen.specifications.map((spec, index) => {
							return (
								<li key={index} className="flex gap-3 mt-1">
									<img className="w-6 h-6" src={star} alt="Star Image 3d" />
									{spec}
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		</div>
	);
}

export default ScreenInfo;
