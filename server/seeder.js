const Room = require('./models/Room');

const seedRooms = async () => {
  try {
    const existingRoomsCount = await Room.countDocuments();
    if (existingRoomsCount === 0) {
      console.log('Seeding 200 Indian Seminar Halls...');
      const roomsToSeed = [];
      
      const departments = [
        'Ministry of Information Technology', 'Ministry of Electronics', 'Ministry of Human Resource Development', 
        'Ministry of Finance', 'Ministry of Defence', 'Ministry of Home Affairs', 'Ministry of External Affairs',
        'Ministry of Education', 'Ministry of Health and Family Welfare', 'Ministry of Road Transport and Highways',
        'Ministry of Railways', 'Ministry of Agriculture', 'Ministry of Science and Technology',
        'Ministry of Environment, Forest and Climate Change', 'Ministry of Power', 'Ministry of Textiles',
        'Ministry of Urban Development', 'Ministry of Women and Child Development', 'Ministry of Civil Aviation',
        // Engineering specific
        'IT', 'Electronics', 'HR', 'Mechanical', 'Civil', 'Electrical', 'Computer Science'
      ];
      const cities = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Surat'];
      
      const hallNamesPrefix = [
        'Meghnad Saha', 'Gyan Mandir', 'Kautilya', 'APJ Abdul Kalam', 
        'Aryabhata', 'Homi Bhabha', 'C.V. Raman', 'Srinivasa Ramanujan', 
        'Amartya Sen', 'Jagadish Chandra Bose', 'Vikram Sarabhai', 
        'Satyendra Nath Bose', 'Rabindranath Tagore', 'Swami Vivekananda'
      ];
      const hallNamesSuffix = ['Seminar Hall', 'Auditorium', 'Conference Room', 'Meeting Hall', 'Boardroom'];
      
      const possibleFacilities = ['Projector', 'Whiteboard', 'Water', 'Pens', 'TV', 'Teleconference', 'AC', 'PA System'];

      const unsplashImages = [
        '/rooms/1.jpg',
        '/rooms/2.jpg',
        '/rooms/3.jpg',
        '/rooms/4.jpg',
        '/rooms/5.jpg',
        '/rooms/6.jpg',
        '/rooms/7.jpg',
        '/rooms/8.jpg',
        '/rooms/9.jpg',
        '/rooms/10.jpg'
      ];
      
      for (let i = 1; i <= 200; i++) {
        // Build a random unique name
        const prefix = hallNamesPrefix[Math.floor(Math.random() * hallNamesPrefix.length)];
        const suffix = hallNamesSuffix[Math.floor(Math.random() * hallNamesSuffix.length)];
        const name = `${prefix} ${suffix} ${i}`; // Append iterator to ensure naming uniqueness
        
        const city = cities[Math.floor(Math.random() * cities.length)];
        const randDept = departments[Math.floor(Math.random() * departments.length)];
        
        const facilities = [];
        const numOfFacilities = Math.floor(Math.random() * 5) + 2;
        for (let j = 0; j < numOfFacilities; j++) {
          const fac = possibleFacilities[Math.floor(Math.random() * possibleFacilities.length)];
          if (!facilities.includes(fac)) facilities.push(fac);
        }

        const randomImage = unsplashImages[Math.floor(Math.random() * unsplashImages.length)];

        roomsToSeed.push({
          name: name,
          building: `${city} Campus`,
          department: randDept,
          capacity: Math.floor(Math.random() * 190) + 10, // 10 to 200
          facilities,
          image: randomImage,
          videoConferenceEnabled: Math.random() > 0.4
        });
      }

      await Room.insertMany(roomsToSeed);
      console.log('200 detailed Indian seminar halls seeded successfully!');
    } else {
      console.log(`Rooms already seeded. Current count: ${existingRoomsCount}`);
    }
  } catch (error) {
    console.error(`Error seeding rooms: ${error.message}`);
  }
};

module.exports = seedRooms;
