const getImageUrl = (name) => `${import.meta.env.VITE_APP_FRONTENDURI}/review-images/${name}.png`;

const testimonials = [
   {
      body: "It's really amazing experience. I love all the work you put into your decoration and setting the room.The entryway decor was outstanding!!! Just so beautiful and perfect 😍 I LOVED how the ballroom doors looked with the flower framed photos and name in lights overhead. Thank you for your beautiful work and making the party so special for us..Many, many thanks for the wonderful job you did 😊👍",
      author: {
         name: "Hari Bhavya",
         rating: 5,
         imageUrl: getImageUrl("Hari Bhavya")
      }
   },
   {
      body: "This is my first experience with miniflicks, and it's awesome, what a decoration it's like superb, Fogg entry was next level in this and price is also very competitive to any other private theaters. Cake also good. I will highly recommend for birthday celebrations. Thanks for Miniflicks for this many memories!!❤️🥳",
      author: {
         name: "Balu Rock Star",
         rating: 5,
         imageUrl: getImageUrl("Balu Rock Star")
      }
   },
   {
      body: "I didn't expect those kind of halls and decorations,they are really amazing and mesmerising party halls 😍😍 wroth visiting @miniflicks_marathahalli",
      author: {
         name: "Bhavana Ms",
         rating: 5,
         imageUrl: getImageUrl("Bhavana Ms")
      }
   },
   {
      body: "Very pleasant place with great ambience, prices are affordable, food is tasty. Celebrated my birthday here 💜 loved it . Thank you Miniflicks team .",
      author: {
         name: "Sailakshmi Dusi",
         rating: 5,
         imageUrl: getImageUrl("Sailakshmi Dusi")
      }
   },
   {
      body: "Really a wonderful experience I love the place and decoration in such a affordable price ,anyone can prefer this ,going to celebrate all occasion with miniflcks 😀",
      author: {
         name: "Mrudusmita Dash",
         rating: 5,
         imageUrl: getImageUrl("Mrudusmita Dash")
      }
   },
   {
      body: "This place has quickly become my new favorite! It's simply fantastic the seats are incredibly comfortable. The staff are friendly and helpful and the maintenance and sound system are top-notch.we had a wonderful time here and i highly recommend it to anyone looking for a great private theatre experience with your loved once friends and family members.",
      author: {
         name: "Spoorthi Pendyala",
         rating: 5,
         imageUrl: getImageUrl("Spoorthi Pendyala")
      }
   },
   {
      body: "MiniFlicks exceeded expectations with their impeccable decoration and designs. The ambiance was enchanting, creating a perfect backdrop for unforgettable moments. Every detail showcased thoughtful planning and creativity, making the celebration truly special. Highly recommended for those seeking a memorable and aesthetically pleasing event venue.",
      author: {
         name: "Sanjeev G",
         rating: 5,
         imageUrl: getImageUrl("Sanjeev G")
      }
   },
   {
      body: "Hi, I booked Miniflicks Private Theatre for my son’s birthday on September 12th, 2024, and it was an amazing experience! The staff was incredibly supportive and delivered everything they promised. They were patient in understanding our requirements and ensured everything was done on time. I would highly recommend this place for hosting small parties and events—100% satisfied.",
      author: {
         name: "K Sampath Kumar",
         rating: 5,
         imageUrl: getImageUrl("K Sampath Kumar")
      }
   },
   {
      body: "The decoration is extremely beautiful and the approach of the team is also very good You  must celebrate your friends and loved one special occasion with them 🥳🥳 very affordable price😊 nd thank you so much @Miniflicks Private theatre ♥️",
      author: {
         name: "Kiran Gowd",
         rating: 5,
         imageUrl: getImageUrl("Kiran Gowd")
      }
   },
   {
      body: "I'm very happy.. nd I want to say TQ for sir.. he decorated the theator was amazing..!!  Best price best experience..I wish this party hall grow up with best future ♥️😇",
      author: {
         name: "Saniya Banu",
         rating: 5,
         imageUrl: getImageUrl("Saniya Banu")
      }
   },
   {
      body: "We had a wonderful experience celebrating our event for the first time. The decorations were impressive and added a lot to the atmosphere. Overall, it was definitely worth the investment. Thank you for making it special.",
      author: {
         name: "Lakshman D",
         rating: 5,
         imageUrl: getImageUrl("Lakshman D")
      }
   },
   {
      body: "Had an amazing experience here. Team was very responsible, friendly and the service was excellent. I recommend people who want to have a surprise birthday celebration for their family members or friends just go for it without any hesitation. Thank you Miniflicks for giving such a beautiful memories.",
      author: {
         name: "Mahitha Deepu",
         rating: 5,
         imageUrl: getImageUrl("Mahitha Deepu")
      }
   },

];

// Sort testimonials alphabetically by author name
testimonials.sort((a, b) => a.author.name.localeCompare(b.author.name));

export default testimonials;
