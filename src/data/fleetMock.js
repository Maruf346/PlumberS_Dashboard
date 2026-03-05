// src/data/fleetMock.js
// Mock vehicle data matching Django Vehicle model + Figma display fields.
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

export const FLEET_PAGE_SIZES        = [5, 10, 15, 20]
export const FLEET_DEFAULT_PAGE_SIZE = 5

export const VEHICLES = [
  { id:'VEH-001', name:'Truck 01', plate:'ABC-1234', picture:null, status:'healthy',         is_active:true,  current_odometer_km:42500,  next_service_km:57500,  last_inspection:'Oct 20, 2023', assigned_to:'Mike Ross',   make:'Ford',          model_name:'Transit',    year:2021, notes:'Regular workhorse.', created_at:'2022-01-14' },
  { id:'VEH-002', name:'Truck 05', plate:'XYZ-9876', picture:null, status:'issue_reported',  is_active:true,  current_odometer_km:67200,  next_service_km:69200,  last_inspection:'Oct 18, 2023', assigned_to:'David Kim',   make:'Ford',          model_name:'F-150',      year:2020, notes:'Brake noise reported.', created_at:'2022-03-05' },
  { id:'VEH-003', name:'Van 04',   plate:'LMN-4567', picture:null, status:'healthy',         is_active:true,  current_odometer_km:29800,  next_service_km:37800,  last_inspection:'Oct 22, 2023', assigned_to:'Sarah Lee',   make:'Mercedes-Benz', model_name:'Sprinter',   year:2022, notes:'',                   created_at:'2022-06-18' },
  { id:'VEH-004', name:'Truck 12', plate:'PQR-2468', picture:null, status:'inspection_due',  is_active:true,  current_odometer_km:88900,  next_service_km:89400,  last_inspection:'Sep 30, 2023', assigned_to:null,          make:'Chevrolet',     model_name:'Silverado',  year:2019, notes:'Annual inspection overdue.', created_at:'2021-09-09' },
  { id:'VEH-005', name:'Van 07',   plate:'JKL-1357', picture:null, status:'service_overdue', is_active:true,  current_odometer_km:95400,  next_service_km:95250,  last_inspection:'Oct 15, 2023', assigned_to:'Emily Chen',  make:'Ford',          model_name:'Transit',    year:2018, notes:'Service interval extended.', created_at:'2020-10-01' },
  { id:'VEH-006', name:'Van 02',   plate:'DEF-1122', picture:null, status:'healthy',         is_active:true,  current_odometer_km:31200,  next_service_km:45000,  last_inspection:'Oct 19, 2023', assigned_to:'Tom Baker',   make:'Mercedes-Benz', model_name:'Sprinter',   year:2022, notes:'',                   created_at:'2023-02-12' },
  { id:'VEH-007', name:'Truck 08', plate:'GHI-3344', picture:null, status:'inspection_due',  is_active:true,  current_odometer_km:72100,  next_service_km:73100,  last_inspection:'Sep 28, 2023', assigned_to:'Mike Ross',   make:'RAM',           model_name:'1500',       year:2020, notes:'Inspection reminder sent.', created_at:'2021-04-03' },
  { id:'VEH-008', name:'Van 11',   plate:'STU-5566', picture:null, status:'healthy',         is_active:false, current_odometer_km:18500,  next_service_km:30000,  last_inspection:'Oct 21, 2023', assigned_to:null,          make:'Ford',          model_name:'Transit',    year:2023, notes:'Awaiting assignment.',created_at:'2024-07-22' },
  { id:'VEH-009', name:'Van 01',   plate:'BCD-2233', picture:null, status:'healthy',         is_active:true,  current_odometer_km:22100,  next_service_km:35000,  last_inspection:'Oct 17, 2023', assigned_to:'Tom Baker',   make:'Ford',          model_name:'Transit',    year:2022, notes:'',                   created_at:'2023-05-10' },
  { id:'VEH-010', name:'Truck 03', plate:'EFG-7788', picture:null, status:'service_overdue', is_active:true,  current_odometer_km:101200, next_service_km:100000, last_inspection:'Oct 14, 2023', assigned_to:'David Kim',   make:'Chevrolet',     model_name:'Silverado',  year:2019, notes:'Service overdue.', created_at:'2020-08-15' },
  { id:'VEH-011', name:'Van 09',   plate:'HIJ-3344', picture:null, status:'inspection_due',  is_active:true,  current_odometer_km:54800,  next_service_km:56000,  last_inspection:'Sep 25, 2023', assigned_to:'Sarah Lee',   make:'Mercedes-Benz', model_name:'Sprinter',   year:2021, notes:'Inspection reminder sent.', created_at:'2021-11-20' },
  { id:'VEH-012', name:'Truck 07', plate:'KLM-9900', picture:null, status:'healthy',         is_active:true,  current_odometer_km:38400,  next_service_km:50000,  last_inspection:'Oct 20, 2023', assigned_to:'Mike Ross',   make:'RAM',           model_name:'2500',       year:2022, notes:'',                   created_at:'2022-09-01' },
]