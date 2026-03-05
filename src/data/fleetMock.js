// src/data/fleetMock.js
// Mock vehicle data matching Django Vehicle model + Figma display fields.
// Includes inspection history and maintenance logs per vehicle for detail page.
// ─────────────────────────────────────────────────────────────────────────────

export const VEHICLE_STATUS = {
  HEALTHY:         'healthy',
  ISSUE_REPORTED:  'issue_reported',
  INSPECTION_DUE:  'inspection_due',
  SERVICE_OVERDUE: 'service_overdue',
}

export const VEHICLE_STATUS_OPTIONS = [
  { value: 'healthy',         label: 'Healthy'         },
  { value: 'issue_reported',  label: 'Issue Reported'  },
  { value: 'inspection_due',  label: 'Inspection Due'  },
  { value: 'service_overdue', label: 'Service Overdue' },
]

export const MAINTENANCE_STATUS_OPTIONS = [
  { value: 'scheduled',   label: 'Scheduled'   },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed'   },
  { value: 'cancelled',   label: 'Cancelled'   },
]

export const FLEET_PAGE_SIZES        = [10, 15, 20]
export const FLEET_DEFAULT_PAGE_SIZE = 10

// ── Per-vehicle inspection + maintenance history (mock backend relations) ──────
export const VEHICLE_INSPECTIONS = {
  'VEH-001': [
    { id: 'INS-101', date: 'Oct 20, 2023', inspector: 'Mike Ross',   odometer_km: 41200, passed: true,  issues: [],                                       notes: 'All systems checked. Tyres at 80%.' },
    { id: 'INS-092', date: 'Jul 12, 2023', inspector: 'Sarah Lee',   odometer_km: 36800, passed: true,  issues: [],                                       notes: 'Routine check. No issues found.' },
    { id: 'INS-078', date: 'Apr 05, 2023', inspector: 'Mike Ross',   odometer_km: 31500, passed: false, issues: ['Wiper blades worn'],                    notes: 'Wiper blades replaced during same visit.' },
  ],
  'VEH-002': [
    { id: 'INS-103', date: 'Oct 18, 2023', inspector: 'David Kim',   odometer_km: 66900, passed: false, issues: ['Brake noise — front left'],             notes: 'Reported by driver. Referred to workshop.' },
    { id: 'INS-089', date: 'Jun 30, 2023', inspector: 'Emily Chen',  odometer_km: 61200, passed: true,  issues: [],                                       notes: 'Pre-job inspection. OK to deploy.' },
  ],
  'VEH-003': [
    { id: 'INS-105', date: 'Oct 22, 2023', inspector: 'Sarah Lee',   odometer_km: 29600, passed: true,  issues: [],                                       notes: 'Post-service check. All clear.' },
    { id: 'INS-091', date: 'Jul 18, 2023', inspector: 'Tom Baker',   odometer_km: 24100, passed: true,  issues: [],                                       notes: '' },
  ],
  'VEH-004': [
    { id: 'INS-098', date: 'Sep 30, 2023', inspector: 'Emily Chen',  odometer_km: 87200, passed: false, issues: ['Inspection overdue — 23 days late'],    notes: 'Vehicle grounded until inspection completed.' },
    { id: 'INS-082', date: 'Jun 10, 2023', inspector: 'Sarah Lee',   odometer_km: 80400, passed: true,  issues: [],                                       notes: 'Routine annual check. Passed.' },
  ],
  'VEH-005': [
    { id: 'INS-102', date: 'Oct 15, 2023', inspector: 'Emily Chen',  odometer_km: 94800, passed: false, issues: ['Service overdue by 150 km'],            notes: 'Awaiting service booking.' },
    { id: 'INS-085', date: 'Jul 01, 2023', inspector: 'Mike Ross',   odometer_km: 88200, passed: true,  issues: [],                                       notes: 'Tyres replaced. All OK.' },
    { id: 'INS-070', date: 'Feb 14, 2023', inspector: 'Tom Baker',   odometer_km: 80100, passed: true,  issues: [],                                       notes: '' },
  ],
  'VEH-006': [
    { id: 'INS-104', date: 'Oct 19, 2023', inspector: 'Tom Baker',   odometer_km: 31000, passed: true,  issues: [],                                       notes: 'All good. Ready for deployment.' },
  ],
  'VEH-007': [
    { id: 'INS-099', date: 'Sep 28, 2023', inspector: 'Mike Ross',   odometer_km: 71400, passed: false, issues: ['Annual inspection overdue'],            notes: 'Driver notified. Schedule within 7 days.' },
    { id: 'INS-083', date: 'Jun 15, 2023', inspector: 'David Kim',   odometer_km: 65000, passed: true,  issues: [],                                       notes: '' },
  ],
  'VEH-008': [
    { id: 'INS-106', date: 'Oct 21, 2023', inspector: 'Sarah Lee',   odometer_km: 18300, passed: true,  issues: [],                                       notes: 'Pre-deployment check. New vehicle — all systems OK.' },
  ],
  'VEH-009': [
    { id: 'INS-100', date: 'Oct 17, 2023', inspector: 'Tom Baker',   odometer_km: 21900, passed: true,  issues: [],                                       notes: '' },
    { id: 'INS-087', date: 'Jul 05, 2023', inspector: 'Sarah Lee',   odometer_km: 15200, passed: true,  issues: [],                                       notes: 'Clean bill of health.' },
  ],
  'VEH-010': [
    { id: 'INS-101', date: 'Oct 14, 2023', inspector: 'David Kim',   odometer_km: 100600, passed: false, issues: ['Service overdue — 1,200 km past limit'], notes: 'Service appointment booked for Oct 28.' },
    { id: 'INS-086', date: 'Jun 22, 2023', inspector: 'Emily Chen',  odometer_km: 91000, passed: true,  issues: [],                                       notes: '' },
  ],
  'VEH-011': [
    { id: 'INS-097', date: 'Sep 25, 2023', inspector: 'Sarah Lee',   odometer_km: 54200, passed: false, issues: ['Inspection overdue — 28 days'],         notes: 'Reminder sent to fleet manager.' },
    { id: 'INS-079', date: 'May 10, 2023', inspector: 'Tom Baker',   odometer_km: 46800, passed: true,  issues: [],                                       notes: '' },
  ],
  'VEH-012': [
    { id: 'INS-107', date: 'Oct 20, 2023', inspector: 'Mike Ross',   odometer_km: 38100, passed: true,  issues: [],                                       notes: 'Full pre-season inspection. All clear.' },
    { id: 'INS-090', date: 'Jul 08, 2023', inspector: 'David Kim',   odometer_km: 31200, passed: true,  issues: [],                                       notes: '' },
  ],
}

export const VEHICLE_MAINTENANCE = {
  'VEH-001': [
    { id: 'MNT-201', date: 'Sep 15, 2023', type: 'Oil Change',        status: 'completed',   cost: 180,  workshop: 'City Auto Works',   notes: 'Synthetic 5W-30. Next due at 52,500 km.' },
    { id: 'MNT-188', date: 'May 20, 2023', type: 'Tyre Rotation',     status: 'completed',   cost: 95,   workshop: 'QuickFit Tyres',    notes: 'All four rotated and balanced.' },
    { id: 'MNT-220', date: 'Nov 10, 2023', type: 'Full Service',       status: 'scheduled',   cost: null, workshop: 'City Auto Works',   notes: 'Scheduled at 50,000 km mark.' },
  ],
  'VEH-002': [
    { id: 'MNT-215', date: 'Oct 20, 2023', type: 'Brake Inspection',  status: 'in_progress', cost: null, workshop: 'BrakePro Centre',   notes: 'Investigating front-left noise reported by driver.' },
    { id: 'MNT-196', date: 'Jul 12, 2023', type: 'Oil Change',        status: 'completed',   cost: 175,  workshop: 'City Auto Works',   notes: '' },
  ],
  'VEH-003': [
    { id: 'MNT-210', date: 'Oct 10, 2023', type: 'Full Service',       status: 'completed',   cost: 620,  workshop: 'Mercedes Service', notes: 'Full manufacturer service at 30,000 km.' },
  ],
  'VEH-004': [
    { id: 'MNT-218', date: 'Nov 05, 2023', type: 'Annual Inspection', status: 'scheduled',   cost: null, workshop: 'SafeFleet Garage',  notes: 'Pending — vehicle grounded.' },
    { id: 'MNT-190', date: 'Jun 18, 2023', type: 'Oil Change',        status: 'completed',   cost: 185,  workshop: 'City Auto Works',   notes: '' },
  ],
  'VEH-005': [
    { id: 'MNT-219', date: 'Oct 28, 2023', type: 'Full Service',       status: 'scheduled',   cost: null, workshop: 'Ford Fleet Centre', notes: 'Overdue service. Priority booking.' },
    { id: 'MNT-198', date: 'Jul 20, 2023', type: 'Tyre Replacement',  status: 'completed',   cost: 880,  workshop: 'QuickFit Tyres',    notes: 'All four tyres replaced.' },
    { id: 'MNT-172', date: 'Jan 30, 2023', type: 'Oil Change',        status: 'completed',   cost: 175,  workshop: 'City Auto Works',   notes: '' },
  ],
  'VEH-006': [
    { id: 'MNT-205', date: 'Sep 01, 2023', type: 'Full Service',       status: 'completed',   cost: 640,  workshop: 'Mercedes Service', notes: 'Scheduled manufacturer service.' },
  ],
  'VEH-007': [
    { id: 'MNT-216', date: 'Nov 02, 2023', type: 'Annual Inspection', status: 'scheduled',   cost: null, workshop: 'SafeFleet Garage',  notes: 'Overdue — booked as priority.' },
    { id: 'MNT-193', date: 'Jun 28, 2023', type: 'Oil Change',        status: 'completed',   cost: 170,  workshop: 'City Auto Works',   notes: '' },
  ],
  'VEH-008': [
    { id: 'MNT-221', date: 'Dec 01, 2023', type: 'Full Service',       status: 'scheduled',   cost: null, workshop: 'Ford Fleet Centre', notes: 'First scheduled service at 30,000 km.' },
  ],
  'VEH-009': [
    { id: 'MNT-207', date: 'Aug 20, 2023', type: 'Oil Change',        status: 'completed',   cost: 175,  workshop: 'City Auto Works',   notes: '' },
  ],
  'VEH-010': [
    { id: 'MNT-217', date: 'Oct 28, 2023', type: 'Full Service',       status: 'scheduled',   cost: null, workshop: 'Chevy Fleet Centre', notes: 'Overdue. Priority booking confirmed.' },
    { id: 'MNT-194', date: 'Jul 02, 2023', type: 'Oil Change',        status: 'completed',   cost: 185,  workshop: 'City Auto Works',   notes: '' },
    { id: 'MNT-166', date: 'Jan 15, 2023', type: 'Brake Service',     status: 'completed',   cost: 420,  workshop: 'BrakePro Centre',   notes: 'Front and rear brake pads replaced.' },
  ],
  'VEH-011': [
    { id: 'MNT-214', date: 'Oct 15, 2023', type: 'Annual Inspection', status: 'scheduled',   cost: null, workshop: 'SafeFleet Garage',  notes: '' },
    { id: 'MNT-189', date: 'May 28, 2023', type: 'Oil Change',        status: 'completed',   cost: 175,  workshop: 'City Auto Works',   notes: '' },
  ],
  'VEH-012': [
    { id: 'MNT-212', date: 'Oct 01, 2023', type: 'Full Service',       status: 'completed',   cost: 590,  workshop: 'RAM Service Centre', notes: 'Full pre-season service.' },
    { id: 'MNT-192', date: 'Jun 10, 2023', type: 'Oil Change',        status: 'completed',   cost: 185,  workshop: 'City Auto Works',   notes: '' },
  ],
}

export const VEHICLES = [
  { id:'VEH-001', name:'Truck 01', plate:'ABC-1234', picture:null, status:'healthy',         is_active:true,  current_odometer_km:42500,  next_service_km:57500,  last_inspection:'Oct 20, 2023', assigned_to:'Mike Ross',   make:'Ford',          model_name:'Transit',    year:2021, notes:'Regular workhorse.',           created_at:'2022-01-14' },
  { id:'VEH-002', name:'Truck 05', plate:'XYZ-9876', picture:null, status:'issue_reported',  is_active:true,  current_odometer_km:67200,  next_service_km:69200,  last_inspection:'Oct 18, 2023', assigned_to:'David Kim',   make:'Ford',          model_name:'F-150',      year:2020, notes:'Brake noise reported.',         created_at:'2022-03-05' },
  { id:'VEH-003', name:'Van 04',   plate:'LMN-4567', picture:null, status:'healthy',         is_active:true,  current_odometer_km:29800,  next_service_km:37800,  last_inspection:'Oct 22, 2023', assigned_to:'Sarah Lee',   make:'Mercedes-Benz', model_name:'Sprinter',   year:2022, notes:'',                             created_at:'2022-06-18' },
  { id:'VEH-004', name:'Truck 12', plate:'PQR-2468', picture:null, status:'inspection_due',  is_active:true,  current_odometer_km:88900,  next_service_km:89400,  last_inspection:'Sep 30, 2023', assigned_to:null,           make:'Chevrolet',     model_name:'Silverado',  year:2019, notes:'Annual inspection overdue.',   created_at:'2021-09-09' },
  { id:'VEH-005', name:'Van 07',   plate:'JKL-1357', picture:null, status:'service_overdue', is_active:true,  current_odometer_km:95400,  next_service_km:95250,  last_inspection:'Oct 15, 2023', assigned_to:'Emily Chen',  make:'Ford',          model_name:'Transit',    year:2018, notes:'Service interval extended.',   created_at:'2020-10-01' },
  { id:'VEH-006', name:'Van 02',   plate:'DEF-1122', picture:null, status:'healthy',         is_active:true,  current_odometer_km:31200,  next_service_km:45000,  last_inspection:'Oct 19, 2023', assigned_to:'Tom Baker',   make:'Mercedes-Benz', model_name:'Sprinter',   year:2022, notes:'',                             created_at:'2023-02-12' },
  { id:'VEH-007', name:'Truck 08', plate:'GHI-3344', picture:null, status:'inspection_due',  is_active:true,  current_odometer_km:72100,  next_service_km:73100,  last_inspection:'Sep 28, 2023', assigned_to:'Mike Ross',   make:'RAM',           model_name:'1500',       year:2020, notes:'Inspection reminder sent.',    created_at:'2021-04-03' },
  { id:'VEH-008', name:'Van 11',   plate:'STU-5566', picture:null, status:'healthy',         is_active:false, current_odometer_km:18500,  next_service_km:30000,  last_inspection:'Oct 21, 2023', assigned_to:null,           make:'Ford',          model_name:'Transit',    year:2023, notes:'Awaiting assignment.',          created_at:'2024-07-22' },
  { id:'VEH-009', name:'Van 01',   plate:'BCD-2233', picture:null, status:'healthy',         is_active:true,  current_odometer_km:22100,  next_service_km:35000,  last_inspection:'Oct 17, 2023', assigned_to:'Tom Baker',   make:'Ford',          model_name:'Transit',    year:2022, notes:'',                             created_at:'2023-05-10' },
  { id:'VEH-010', name:'Truck 03', plate:'EFG-7788', picture:null, status:'service_overdue', is_active:true,  current_odometer_km:101200, next_service_km:100000, last_inspection:'Oct 14, 2023', assigned_to:'David Kim',   make:'Chevrolet',     model_name:'Silverado',  year:2019, notes:'Service overdue.',             created_at:'2020-08-15' },
  { id:'VEH-011', name:'Van 09',   plate:'HIJ-3344', picture:null, status:'inspection_due',  is_active:true,  current_odometer_km:54800,  next_service_km:56000,  last_inspection:'Sep 25, 2023', assigned_to:'Sarah Lee',   make:'Mercedes-Benz', model_name:'Sprinter',   year:2021, notes:'Inspection reminder sent.',    created_at:'2021-11-20' },
  { id:'VEH-012', name:'Truck 07', plate:'KLM-9900', picture:null, status:'healthy',         is_active:true,  current_odometer_km:38400,  next_service_km:50000,  last_inspection:'Oct 20, 2023', assigned_to:'Mike Ross',   make:'RAM',           model_name:'2500',       year:2022, notes:'',                             created_at:'2022-09-01' },
]