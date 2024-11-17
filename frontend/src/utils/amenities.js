import { dolby, screen, lighting, reception, sofa, wifi } from './index';

const amenities = [
   {
      title: "Reception 24/7",
      image: reception,
      number: "24/7",
      count: "01",
      description: "Our reception is available 24/7 to assist you with anything you need.",
   },
   {
      title: "High-Speed Internet",
      image: wifi,
      number: "1000 Mbps",
      count: "02",
      description: "Enjoy seamless browsing and streaming with high-speed internet access.",
   },
   {
      title: "Dolby Atmos Sound",
      image: dolby,
      number: "Surround Sound",
      count: "03",
      description: "Experience immersive sound quality with our Dolby Atmos sound system.",
   },
   {
      title: "4K Screen",
      image: screen,
      number: "Ultra HD",
      count: "04",
      description: "Enjoy your movies and shows in stunning 4K resolution for a crystal-clear picture.",
   },
   {
      title: "Comfortable Sofas",
      image: sofa,
      number: "Relaxing",
      count: "05",
      description: "Our sofas are designed for maximum comfort, perfect for a long movie session.",
   },
   {
      title: "Premium Lighting",
      image: lighting,
      number: "Ambient",
      count: "06",
      description: "Our theaters are equipped with premium lighting that enhances your movie experience.",
   },
];

export default amenities;
