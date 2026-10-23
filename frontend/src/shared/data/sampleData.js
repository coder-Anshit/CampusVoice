// ============================================================
//  CampusVoice — Sample Data
//  Paste into your seed script or import directly in React
// ============================================================

// ────────────────────────────────────────────────────────────
//  ISSUES
// ────────────────────────────────────────────────────────────
export const sampleIssues = [
  {
    _id: "issue_001",
    title: "Hostel 3 water supply cuts off every night after 11 PM",
    category: "Hostel",
    description:
      "For the past two weeks, water supply in Hostel Block 3 completely stops after 11 PM. Students returning from  the library can't even wash their hands. This needs urgent attention from  the hostel warden.",
    author: "Priya Sharma",
    isAnonymous: false,
    votes: 47,
    votedBy: [],
    comments: [
      {
        _id: "c_001a",
        author: "Rahul Verma",
        text: "Same issue in Block 4 too. Already complained to warden twice.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "c_001b",
        author: "Anonymous",
        text: "The motor timer needs to be reset. Maintenance team is aware but hasn't fixed it.",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "issue_002",
    title: "WiFi in academic block C drops every 30 minutes",
    category: "Academics",
    description:
      "The WiFi in Academic Block C (especially near Room 204–210) disconnects every 30 minutes and takes 5 minutes to reconnect. During online exams this is a serious problem. Please fix the access point.",
    author: "Anonymous",
    isAnonymous: true,
    votes: 89,
    votedBy: [],
    comments: [
      {
        _id: "c_002a",
        author: "Sneha Patil",
        text: "Raised this with the IT helpdesk 3 weeks ago. Still no response.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "issue_003",
    title: "Mess food quality has dropped significantly this semester",
    category: "Food",
    description:
      "The dal is watery, rice is undercooked and sabzi is the same every alternate day. We pay full mess fees but the quality has really gone down since the new contractor took over in August.",
    author: "Arjun Mehta",
    isAnonymous: false,
    votes: 134,
    votedBy: [],
    comments: [
      {
        _id: "c_003a",
        author: "Divya Nair",
        text: "Sunday's paneer was completely stale. Three people got sick.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "c_003b",
        author: "Karan Singh",
        text: "We should write a formal complaint to the Dean of Students.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "c_003c",
        author: "Anonymous",
        text: "The breakfast options have reduced too. Earlier we had poha and upma both, now it's just one.",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "issue_004",
    title: "Dr. Kapoor cancels lectures without any prior notice",
    category: "Faculty",
    description:
      "DSA lectures with Dr. Kapoor get cancelled at least twice a week without any announcement. We only find out when we're already standing outside the classroom. This is affecting our syllabus coverage seriously.",
    author: "Anonymous",
    isAnonymous: true,
    votes: 61,
    votedBy: [],
    comments: [
      {
        _id: "c_004a",
        author: "Rohit Dubey",
        text: "Missed 8 lectures so far and we're only in week 6 of the semester.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "issue_005",
    title: "Library closes at 8 PM during exam week — should be 24/7",
    category: "Academics",
    description:
      "Every other college around us has 24-hour library access during exams. Our library closes at 8 PM even during end semester exams. Hostel rooms are too noisy to study. We need extended hours at least for the exam month.",
    author: "Meera Joshi",
    isAnonymous: false,
    votes: 202,
    votedBy: [],
    comments: [
      {
        _id: "c_005a",
        author: "Aditya Kumar",
        text: "100% agree. The reading room also has only 40 seats for 800 students.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "c_005b",
        author: "Pooja Iyer",
        text: "We could at least get access to the ground floor. Security can stay.",
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
    ],
    status: "resolved",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "issue_006",
    title: "Sports ground lights not working since Diwali",
    category: "General",
    description:
      "The floodlights on the main sports ground have been out since October. Evening practice for cricket and football teams is impossible. Inter-college tournament is next month and we can't even practice.",
    author: "Vikas Rawat",
    isAnonymous: false,
    votes: 38,
    votedBy: [],
    comments: [],
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "issue_007",
    title: "ATM on campus is always out of cash on salary / stipend days",
    category: "General",
    description:
      "The single ATM on campus runs out of cash every month on 1st and 7th — the days when scholarship and stipend amounts are credited. We have to go 3 km off campus. Either refill it more often or install a second ATM.",
    author: "Anonymous",
    isAnonymous: true,
    votes: 77,
    votedBy: [],
    comments: [
      {
        _id: "c_007a",
        author: "Nandini Rao",
        text: "Had to miss morning classes last month just to get cash for a medical emergency.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "issue_008",
    title: "No female faculty member available for grievance redressal",
    category: "Faculty",
    description:
      "The Internal Complaints Committee is supposed to have a female faculty member available every week. For the past month there has been no one. This is both a policy violation and a serious welfare concern.",
    author: "Anonymous",
    isAnonymous: true,
    votes: 53,
    votedBy: [],
    comments: [],
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// ────────────────────────────────────────────────────────────
//  POLLS
// ────────────────────────────────────────────────────────────
export const samplePolls = [
  {
    _id: "poll_001",
    question: "What time should the mess open for breakfast?",
    options: [
      { text: "6:30 AM", votes: 38 },
      { text: "7:00 AM", votes: 112 },
      { text: "7:30 AM", votes: 54 },
      { text: "8:00 AM", votes: 19 },
    ],
    totalVotes: 223,
    createdBy: "Admin",
    votedBy: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "poll_002",
    question: "Which day should the weekly campus cleanup drive be held?",
    options: [
      { text: "Saturday morning", votes: 89 },
      { text: "Sunday morning", votes: 143 },
      { text: "Wednesday evening", votes: 47 },
      { text: "No fixed day — rotate weekly", votes: 31 },
    ],
    totalVotes: 310,
    createdBy: "Student Council",
    votedBy: [],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "poll_003",
    question: "How would you rate the overall mess food quality this month?",
    options: [
      { text: "Very poor", votes: 67 },
      { text: "Below average", votes: 91 },
      { text: "Average", votes: 48 },
      { text: "Good", votes: 22 },
      { text: "Excellent", votes: 7 },
    ],
    totalVotes: 235,
    createdBy: "Mess Committee",
    votedBy: [],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "poll_004",
    question: "Which elective subject should be added next semester?",
    options: [
      { text: "Machine Learning", votes: 178 },
      { text: "Cybersecurity", votes: 134 },
      { text: "Blockchain & Web3", votes: 89 },
      { text: "UI/UX Design", votes: 112 },
    ],
    totalVotes: 513,
    createdBy: "Academic Council",
    votedBy: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "poll_005",
    question: "Should the hostel curfew timing be extended on weekends?",
    options: [
      { text: "Yes, extend to 11 PM", votes: 201 },
      { text: "Yes, extend to midnight", votes: 87 },
      { text: "No, keep it at 10 PM", votes: 34 },
      { text: "Remove curfew entirely on weekends", votes: 56 },
    ],
    totalVotes: 378,
    createdBy: "Hostel Committee",
    votedBy: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "poll_006",
    question: "What kind of events do you want at the Annual Fest this year?",
    options: [
      { text: "Live music concert", votes: 245 },
      { text: "Hackathon", votes: 189 },
      { text: "Stand-up comedy night", votes: 167 },
      { text: "Cultural performances (dance, drama)", votes: 203 },
    ],
    totalVotes: 804,
    createdBy: "Fest Committee",
    votedBy: [],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// ────────────────────────────────────────────────────────────
//  DISCUSSIONS
// ────────────────────────────────────────────────────────────
export const sampleDiscussions = [
  {
    _id: "disc_001",
    title: "Tips for cracking campus placements — what actually worked for you?",
    body: "Placement season is starting next month and I'm genuinely stressed. For those who got placed last year — what did you actually do differently? DSA practice, projects, communication skills? Drop your honest advice here.",
    author: "Ananya Gupta",
    votes: 94,
    comments: [
      {
        _id: "dc_001a",
        author: "Siddharth Rao",
        text: "LeetCode daily for 3 months + 2 solid projects on GitHub. Mock interviews with friends helped the most.",
        votes: 31,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "dc_001b",
        author: "Priyanka Das",
        text: "Communication matters way more than people think. I failed my first 3 interviews not because of DSA but because I couldn't explain my thought process clearly.",
        votes: 48,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "dc_001c",
        author: "Anonymous",
        text: "Research the company before the interview. Interviewers notice when you know their product stack.",
        votes: 17,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "disc_002",
    title: "Is the new semester credit system actually fair?",
    body: "The new grading system where attendance below 75% automatically drops you a grade feels really harsh. One medical emergency and your GPA tanks. Isn't this punishing students for circumstances beyond their control?",
    author: "Anonymous",
    votes: 143,
    comments: [
      {
        _id: "dc_002a",
        author: "Tanvi Kulkarni",
        text: "Agreed. There should be a medical exemption process that is actually accessible, not just on paper.",
        votes: 52,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "dc_002b",
        author: "Prof. Suggestion",
        text: "The policy exists to ensure accountability. But you're right that the appeals process needs to be more transparent.",
        votes: 24,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "disc_003",
    title: "Anyone else doing freelance work alongside college? How do you manage time?",
    body: "I started taking small web dev projects on Fiverr last month and it's already affecting my sleep and attendance. But the money is genuinely useful. Would love to hear how others balance this without burning out.",
    author: "Vikram Nair",
    votes: 67,
    comments: [
      {
        _id: "dc_003a",
        author: "Ritika Sharma",
        text: "Strict time blocks. Freelance only on weekends and after 9 PM on weekdays. No exceptions or you'll lose control fast.",
        votes: 29,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "dc_003b",
        author: "Anonymous",
        text: "Take only projects with deadlines that give you at least a week buffer. Rush jobs during exam week will destroy you.",
        votes: 41,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "disc_004",
    title: "Mental health resources on campus — do they actually help?",
    body: "The counseling center has only one counselor for 2000+ students. Appointments take 3 weeks. Has anyone actually found the campus mental health support useful? And what do you do when you can't wait 3 weeks?",
    author: "Anonymous",
    votes: 211,
    comments: [
      {
        _id: "dc_004a",
        author: "Deepa Krishnan",
        text: "iCall helpline was genuinely helpful when I couldn't get a campus appointment. Free and confidential.",
        votes: 88,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "dc_004b",
        author: "Saurabh Tiwari",
        text: "The peer support group that meets every Thursday in the student union is actually really good. No pressure, just people talking.",
        votes: 63,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "disc_005",
    title: "Open source project ideas for college students — share yours!",
    body: "Looking to start a meaningful open source project that could also look good on a resume. Any ideas that are actually useful and not just another todo app? Preferably something that could benefit our own campus.",
    author: "Harsh Agarwal",
    votes: 58,
    comments: [
      {
        _id: "dc_005a",
        author: "Neha Choudhary",
        text: "A campus bus tracker that shows real-time location of college buses. The current system is a WhatsApp group with 800 people in it.",
        votes: 71,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "dc_005b",
        author: "Amit Tomar",
        text: "Lost and found portal. So many things get misplaced and there's no central place to report or search.",
        votes: 44,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "dc_005c",
        author: "Jaya Reddy",
        text: "Study room booking system. Right now it's chaos — people just show up and there's no availability info.",
        votes: 37,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// ────────────────────────────────────────────────────────────
//  ANNOUNCEMENTS
// ────────────────────────────────────────────────────────────
export const sampleAnnouncements = [
  {
    _id: "ann_001",
    title: "End semester examination schedule released",
    body: "The end semester examination timetable for all programs (B.Tech, M.Tech, MBA) has been published on the academic portal. Exams begin from  15th December 2026. Students must carry their hall tickets at all times. No entry without a valid hall ticket.",
    type: "Urgent",
    postedBy: "Academic Section",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "ann_002",
    title: "Campus placement drive — Infosys, TCS & Wipro visiting next week",
    body: "Pre-Placement Talks (PPTs) for Infosys, TCS and Wipro will be held on 25th November in the Main Auditorium. All final year students must register on the placement portal by 22nd November. Formal dress code is mandatory. Students with active backlogs are not eligible.",
    type: "Important",
    postedBy: "Training & Placement Cell",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "ann_003",
    title: "Annual technical fest 'InnoVerse 2026' — registrations open",
    body: "InnoVerse 2026, our annual technical festival, will be held from  8th to 10th December. Events include a 24-hour Hackathon, Robowar, Project Expo, and a national-level paper presentation. Registration is free for all students. Teams of 2-4 members. Register before 30th November.",
    type: "Notice",
    postedBy: "Technical Fest Committee",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "ann_004",
    title: "Emergency: Water supply disruption tomorrow 6 AM to 2 PM",
    body: "Due to scheduled maintenance of the main pipeline, water supply across the entire campus will be disrupted on 22nd November from  6 AM to 2 PM. Water tankers will be stationed outside each hostel block and the academic building. Students are advised to store water in advance.",
    type: "Urgent",
    postedBy: "Estate Office",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    _id: "ann_005",
    title: "Scholarship disbursement — PM-YASASVI & State Merit scholarships",
    body: "Students who applied for PM-YASASVI and State Merit scholarships and whose applications have been verified will receive disbursement in the next 7-10 working days. Check your registered bank account and email. Students with pending document submissions must visit the scholarship office by 25th November.",
    type: "Important",
    postedBy: "Scholarship Cell",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "ann_006",
    title: "New library e-resources — NPTEL, Scopus and IEEE Xplore access",
    body: "The library has subscribed to NPTEL online courses, Scopus citation database and IEEE Xplore digital library for 2026-27. Access is available on-campus through your college email. Free training sessions every Tuesday from  3-4 PM.",
    type: "Notice",
    postedBy: "Central Library",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "ann_007",
    title: "Anti-ragging committee — mandatory online pledge for all students",
    body: "As per UGC Anti-Ragging regulations, all students must complete the annual anti-ragging pledge on the UGC portal and submit the confirmation receipt to their department office by 30th November. Failure to comply may result in enrollment hold for the next semester.",
    type: "Urgent",
    postedBy: "Dean of Students",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "ann_008",
    title: "Gym & fitness center timings revised for winter",
    body: "from  1st December, the campus gymnasium timings will change to 5:30 AM - 8:00 AM and 4:00 PM - 8:00 PM on weekdays, and 6:00 AM - 10:00 AM on weekends. Membership renewals for the winter semester are open at the sports office.",
    type: "Notice",
    postedBy: "Sports Department",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
];

// ────────────────────────────────────────────────────────────
//  USERS  (for login / seeding)
// ────────────────────────────────────────────────────────────
export const sampleUsers = [
  {
    _id: "user_001",
    name: "Anshit Heera",
    email: "anshit.heera@campus.edu",
    role: "admin",
    passwordHash: "bcrypt_hash_here",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "user_002",
    name: "Priya Sharma",
    email: "priya.sharma@campus.edu",
    role: "student",
    passwordHash: "bcrypt_hash_here",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "user_003",
    name: "Arjun Mehta",
    email: "arjun.mehta@campus.edu",
    role: "student",
    passwordHash: "bcrypt_hash_here",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "user_004",
    name: "Meera Joshi",
    email: "meera.joshi@campus.edu",
    role: "student",
    passwordHash: "bcrypt_hash_here",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
];