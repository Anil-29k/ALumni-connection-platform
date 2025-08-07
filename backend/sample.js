const sampleColleges = [
    {
      basicInfo: {
        collegeName: 'Nalanda University',
        location: 'India',
        contact: {
          email: 'info@nalanda.edu',
          phone: '123-4585-7890'
        },
        website: 'https://www.nalanda.edu',
        establishedYear: 1950,
        accreditation: ['ABET', 'AACSB']
      },
      academicInfo: {
        degreesOffered: ['BSc', 'MSc', 'PhD'],
        departments: ['Computer Science', 'Mechanical Engineering', 'Business'],
        courses: ['Data Structures', 'Thermodynamics', 'Corporate Finance'],
        facultyCount: 200
      },
      infrastructure: {
        campusArea: '150 acres',
        facilities: ['Library', 'Sports Complex', 'Auditorium'],
        hostel: {
          available: true,
          details: 'Separate hostel for boys and girls with 500 rooms each.'
        },
        classrooms: 50,
        labs: 20
      },
      events: {
        upcomingEvents: [
          {
            title: 'Tech Expo 2024',
            date: new Date('2024-06-15'),
            venue: 'Main Auditorium',
            topic: 'Emerging Technologies',
            coordinator: { 
              contact: { email: 'johndoe@greenwood.edu' }, // Nested contact
              name: 'John Doe' 
            },
            description: 'A showcase of innovative projects by students and faculty.'
          }
        ],
        ongoingEvents: [],
        completedEvents: [
          {
            title: 'Annual Sports Meet 2023',
            date: new Date('2023-03-10'),
            venue: 'Sports Ground',
            topic: 'Inter-college sports competitions',
            coordinator: { 
              contact: { email: 'janesmith@greenwood.edu' }, // Nested contact
              name: 'Jane Smith' 
            },
            description: 'Various sports activities held among colleges.'
          }
        ]
      },
      careerServices: {
        careerCounseling: 'Weekly career guidance sessions available.',
        internshipOpportunities: ['Google', 'Microsoft', 'Tesla'],
        jobPlacementStats: '90% of graduates receive job offers within 6 months.'
      },
      socialMedia: {
        facebook: 'https://www.facebook.com/greenwooduniversity',
        twitter: 'https://twitter.com/greenwooduni',
        instagram: 'https://www.instagram.com/greenwooduni',
        linkedin: 'https://www.linkedin.com/school/greenwood-university/',
        onlineGroups: ['Alumni Network', 'Tech Innovators Club']
      },
      collaborations: {
        partnerInstitutions: ['MIT', 'Stanford University'],
        industryPartnerships: ['IBM', 'Google', 'Apple']
      },
      rankingsRecognition: {
        rankings: ['#10 in Computer Science by QS Rankings'],
        awards: ['Best Research University 2022']
      },
      communities: [
        {
          communityName: 'Greenwood Coding Club',
          communityProfilePhoto: 'https://www.greenwood.edu/coding-club.jpg',
          communityDesc: 'A community of coders exploring new technologies.',
          createdDate: new Date('2018-05-10'),
          membersCount: 150
        },
        {
          communityName: 'Business Leaders Society',
          communityProfilePhoto: 'https://www.greenwood.edu/bls.jpg',
          communityDesc: 'A platform for aspiring business leaders.',
          createdDate: new Date('2017-08-15'),
          membersCount: 100
        }
      ],
      miscellaneous: {
        motto: 'Knowledge, Integrity, Success',
        campusCulture: 'Vibrant and inclusive with a focus on innovation.',
        healthAndSafety: '24/7 health center and security surveillance on campus.'
      }
    }
  ];
  export default sampleColleges;