// src/data/jobDetailsMock.js

export const JOB_DETAIL_MOCK = {
  id:          'JB-1024',
  title:       'Quarterly HVAC Inspection & Leak Repair',
  status:      'In Progress',
  priority:    'High Priority',
  description: 'Perform scheduled quarterly maintenance on main commercial cooling tower units. Includes full inspection of all pipe junctions, pressure testing, leak identification and repair, and system sign-off documentation. All safety protocols must be completed prior to any pressurised work.',

  client: {
    name:         'Apex Industries',
    address:      '458 Industrial Ave, New York, NY 10018',
    contactPerson:'Robert Chen',
    siteAccess:   'Gate B - Code 4589',
    phone:        '+1 (212) 555-0182',
  },

  schedule: {
    date:        'Oct 24, 2023',
    timeWindow:  '08:00 AM – 04:00 PM',
    duration:    '8h 00m',
    progressPct: 33,
  },

  assignee: {
    name:  'Mike Ross',
    role:  'Senior HVAC Tech',
    initial: 'MR',
  },

  vehicle: {
    label:  'Van-04 (Ford Transit)',
    status: 'Active',
  },

  activity: [
    { event: 'Technician En Route',       time: '07:45 AM', actor: 'Mike Ross', done: true  },
    { event: 'Arrived at Site',           time: '08:10 AM', actor: 'Mike Ross', done: true  },
    { event: 'Job Started',               time: '08:15 AM', actor: 'Mike Ross', done: true  },
    { event: 'Safety Form Submitted',     time: '09:30 AM', actor: 'Mike Ross', done: true  },
    { event: 'Leak Identified – Part Request', time: '10:15 AM', actor: 'Mike Ross', done: false },
  ],

  lineItems: [
    { item: 'Quarterly Maintenance Service', qty: 1, unitPrice: 150.00, total: 150.00 },
    { item: 'PVC Pipe Junction – 2"',        qty: 2, unitPrice:  25.50, total:  51.00 },
    { item: 'Labor Hours (Estimated)',        qty: 4, unitPrice:  85.00, total: 340.00 },
  ],
  totalEstimated: 541.00,

  checklist: [
    { task: 'Site Safety Assessment',    done: true  },
    { task: 'Lockout/Tagout Procedures', done: true  },
    { task: 'Cooling Tower Inspection',  done: true  },
    { task: 'Leak Identification',       done: true  },
    { task: 'Pipe Repair / Welding',     done: false },
    { task: 'System Pressure Test',      done: false },
    { task: 'Final Sign-off',            done: false },
  ],
}
