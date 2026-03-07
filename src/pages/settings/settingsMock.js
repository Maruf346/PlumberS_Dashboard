// src/pages/settings/settingsMock.js
// Mock data for all settings tabs — replace with API calls when backend ready
// To stop using mock data: remove the import of this file in each tab
// and uncomment the API fetch blocks instead.

export const MOCK_PROFILE = {
  id:              'ADM-001',
  full_name:       'Admin User',
  email:           'admin@adelaideplumbing.com.au',
  phone:           '+61 4 1234 5678',
  profile_picture: null,
  created_at:      '2024-01-15T08:00:00Z',
  updated_at:      '2025-10-01T12:00:00Z',
}

export const MOCK_TERMS = {
  content:    `<h2>Terms and Conditions</h2><p>Welcome to Adelaide Plumbing and Gasfitting. By accessing or using our platform, you agree to be bound by these Terms and Conditions.</p><h3>1. Use of the Platform</h3><p>This admin console is strictly for authorised personnel only. Unauthorised access is prohibited and may be subject to legal action.</p><h3>2. Data Handling</h3><p>All data processed through this platform must be handled in accordance with applicable privacy laws including the Australian Privacy Act 1988.</p><h3>3. Liability</h3><p>Adelaide Plumbing and Gasfitting shall not be liable for any indirect, incidental, or consequential damages arising from the use of this platform.</p>`,
  updated_at: '2025-09-20T10:30:00Z',
}

export const MOCK_PRIVACY = {
  content:    `<h2>Privacy Policy</h2><p>Adelaide Plumbing and Gasfitting is committed to protecting the privacy of our staff, clients, and partners.</p><h3>Information We Collect</h3><p>We collect personal information necessary to provide our field operations services, including names, contact details, job addresses, and service records.</p><h3>How We Use Your Information</h3><p>Information is used to manage job assignments, communicate with clients, maintain safety records, and improve our services.</p><h3>Data Security</h3><p>We implement industry-standard security measures to protect your data from unauthorised access, alteration, or disclosure.</p>`,
  updated_at: '2025-09-18T14:00:00Z',
}

export const MOCK_ABOUT = {
  content:    `<h2>About Adelaide Plumbing and Gasfitting</h2><p>Adelaide Plumbing and Gasfitting has been proudly serving South Australia since 1998. We specialise in residential and commercial plumbing, gas fitting, drainage, and emergency repair services.</p><h3>Our Mission</h3><p>To deliver reliable, high-quality plumbing and gasfitting services with a commitment to safety, integrity, and customer satisfaction.</p><h3>Our Team</h3><p>Our team of licensed plumbers and gasfitters bring decades of combined experience to every job. We are fully insured and compliant with all South Australian regulations.</p>`,
  updated_at: '2025-08-10T09:00:00Z',
}

export const MOCK_FEEDBACK = [
  { id: 'FB-001', first_name: 'James', last_name: 'Carter',  email: 'james@example.com', submitted_by: 'James Carter', submitted_by_email: 'james@example.com', country: 'Australia', language: 'English', phone: '+61 4 9876 5432', message: 'The app is really intuitive and easy to use. Would love to see a dark mode option added in a future update.', created_at: '2025-10-20T08:30:00Z', updated_at: '2025-10-20T08:30:00Z' },
  { id: 'FB-002', first_name: 'Sarah', last_name: 'Mitchell', email: 'sarah@example.com', submitted_by: 'Sarah Mitchell', submitted_by_email: 'sarah@example.com', country: 'Australia', language: 'English', phone: '+61 4 8765 4321', message: 'Scheduling works great. It would be helpful if we could set recurring jobs automatically.', created_at: '2025-10-18T14:15:00Z', updated_at: '2025-10-18T14:15:00Z' },
  { id: 'FB-003', first_name: 'Tony',  last_name: 'Nguyen',  email: 'tony@example.com',  submitted_by: 'Tony Nguyen',  submitted_by_email: 'tony@example.com',  country: 'Australia', language: 'English', phone: '+61 4 7654 3210', message: 'Overall very satisfied. The job tracking is excellent. Would appreciate push notifications for job updates.', created_at: '2025-10-15T11:00:00Z', updated_at: '2025-10-15T11:00:00Z' },
  { id: 'FB-004', first_name: 'Lisa',  last_name: 'Park',    email: 'lisa@example.com',  submitted_by: 'Lisa Park',    submitted_by_email: 'lisa@example.com',  country: 'Australia', language: 'English', phone: '+61 4 6543 2109', message: 'Great platform overall. The report templates are very useful for our compliance needs.', created_at: '2025-10-12T09:45:00Z', updated_at: '2025-10-12T09:45:00Z' },
]

export const MOCK_ISSUES = [
  { id: 'IS-001', title: 'App crashes when uploading large photos', submitted_by: 'Mike Ross', submitted_by_email: 'mike.ross@fieldops.com', submitted_by_id: 'STF-001', description: 'When trying to upload photos larger than 10MB on the mobile app, the application crashes without any error message. This has happened three times this week.', photo_1: null, photo_2: null, photo_3: null, photo_4: null, photo_5: null, photo_count: '0', created_at: '2025-10-22T07:20:00Z', updated_at: '2025-10-22T07:20:00Z' },
  { id: 'IS-002', title: 'Job status not updating in real time', submitted_by: 'John Doe',  submitted_by_email: 'john.doe@fieldops.com',  submitted_by_id: 'STF-002', description: 'After marking a job as complete on the mobile app, the dashboard still shows it as In Progress for several minutes. Refreshing manually fixes it but it should update automatically.', photo_1: null, photo_2: null, photo_3: null, photo_4: null, photo_5: null, photo_count: '0', created_at: '2025-10-21T13:40:00Z', updated_at: '2025-10-21T13:40:00Z' },
  { id: 'IS-003', title: 'Cannot submit safety form offline', submitted_by: 'Lisa Park',  submitted_by_email: 'lisa.park@fieldops.com',  submitted_by_id: 'STF-003', description: 'When working in areas with no mobile signal, the safety form cannot be saved for later submission. All progress is lost when the app is closed.', photo_1: null, photo_2: null, photo_3: null, photo_4: null, photo_5: null, photo_count: '2', created_at: '2025-10-19T10:10:00Z', updated_at: '2025-10-19T10:10:00Z' },
]

export const MOCK_FAQS = [
  { id: 'FAQ-001', question: 'How do I create a new job?',                   answer: 'Navigate to the Jobs page and click the "Create Job" button in the top right. Fill in the required fields including client details, job description, and assignment information, then click "Create Job" to save.' },
  { id: 'FAQ-002', question: 'How do I schedule a job?',                     answer: 'Go to the Schedule page. Unscheduled jobs appear in the left panel. Drag any job card onto the calendar on the date you want to schedule it. A time picker will appear to set the start time.' },
  { id: 'FAQ-003', question: 'How do I add a new staff member?',             answer: 'Navigate to Employees > Staff and click "Add Staff". Fill in the staff member\'s personal details, role, and contact information. The staff member will receive an invitation email to set up their mobile app account.' },
  { id: 'FAQ-004', question: 'How do I reset a manager\'s password?',        answer: 'Go to Employees > Managers, find the manager profile, and click "Edit". From the edit drawer you can trigger a password reset email to be sent to the manager\'s registered email address.' },
  { id: 'FAQ-005', question: 'What are safety requirement forms?',           answer: 'Safety requirement forms are templates that define the safety checks a staff member must complete before starting a job. They are created in the Safety Forms section and can be attached to jobs during job creation.' },
]
