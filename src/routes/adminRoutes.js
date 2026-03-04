// ─────────────────────────────────────────────────────────────────────────────
// src/routes/adminRoutes.js
// Single source of truth: route path ↔ page component ↔ sidebar label/icon
// ─────────────────────────────────────────────────────────────────────────────

import DashboardPage       from '@/pages/dashboard/DashboardPage'
import JobsPage            from '@/pages/jobs/JobsPage'
import SchedulePage        from '@/pages/schedule/SchedulePage'
import FleetPage           from '@/pages/fleet/FleetPage'
import SafetyFormsPage     from '@/pages/safety/SafetyFormsPage'
import EmployeesPage       from '@/pages/employees/EmployeesPage'
import ReportsPage         from '@/pages/reports/ReportsPage'
import SettingsPage        from '@/pages/settings/SettingsPage'
import CreateJobPage       from '@/pages/createjob/CreateJobPage'
import JobDetailsPage      from '@/pages/jobdetails/JobDetailsPage'
import FilePhotosPage      from '@/pages/filephotos/FilePhotosPage'
import NotesPage           from '@/pages/notes/NotesPage'
import CreateManagerPage   from '@/pages/createmanager/CreateManagerPage'
import EditJobPage         from '@/pages/editjob/EditJobPage'
import ManagersPage         from '@/pages/managers/ManagersPage'
import ManagerProfilePage   from '@/pages/managers/ManagerProfilePage'
import StaffPage            from '@/pages/staff/StaffPage'
import StaffProfilePage     from '@/pages/staff/StaffProfilePage'

/**
 * navItems — items that appear in the sidebar navigation.
 * `path` is relative to /admin/
 */
export const navItems = [
  {
    path:   'dashboard',
    label:  'Dashboard',
    icon:   'dashboard',
  },
  {
    path:   'jobs',
    label:  'Jobs',
    icon:   'jobs',
  },
  {
    path:   'schedule',
    label:  'Schedule',
    icon:   'schedule',
  },
  {
    path:   'fleet',
    label:  'Fleet',
    icon:   'fleet',
  },
  {
    path:   'safety-forms',
    label:  'Safety Forms',
    icon:   'safety',
  },
  {
    path:   'employees',
    label:  'Employees',
    icon:   'employees',
  },
  {
    path:   'managers',
    label:  'Managers',
    icon:   'managers',
  },
  {
    path:   'staff',
    label:  'Staff',
    icon:   'staff',
  },
  {
    path:   'reports',
    label:  'Reports',
    icon:   'reports',
  },
  {
    path:   'settings',
    label:  'Settings',
    icon:   'settings',
  },
]

/**
 * routes — all /admin/* page routes including non-nav pages.
 */
export const routes = [
  { path: 'dashboard',      element: DashboardPage     },
  { path: 'jobs',           element: JobsPage          },
  // { path: 'schedule',       element: SchedulePage      },
  // { path: 'fleet',          element: FleetPage         },
  // { path: 'safety-forms',   element: SafetyFormsPage   },
  // { path: 'employees',      element: EmployeesPage     },
  // { path: 'reports',        element: ReportsPage       },
  // { path: 'settings',       element: SettingsPage      },
  { path: 'create-job',     element: CreateJobPage     },
  { path: 'jobs/:jobId',      element: JobDetailsPage    },
  { path: 'jobs/:jobId/edit', element: EditJobPage       },
  { path: 'managers',           element: ManagersPage       },
  { path: 'managers/:managerId',element: ManagerProfilePage },
  { path: 'staff',              element: StaffPage          },
  { path: 'staff/:staffId',     element: StaffProfilePage   },
  // { path: 'jobs/:jobId/files',  element: FilePhotosPage  },
  // { path: 'jobs/:jobId/notes',  element: NotesPage       },
  { path: 'create-manager', element: CreateManagerPage },
]

/**
 * pageTitles — breadcrumb / header title map keyed by route segment.
 */
export const pageTitles = {
  dashboard:        'Dashboard',
  jobs:             'Jobs',
  schedule:         'Schedule',
  fleet:            'Fleet',
  'safety-forms':   'Safety Forms',
  employees:        'Employees',
  reports:          'Reports',
  settings:         'Settings',
  'create-job':     'Create Job',
  managers:          'Managers',
  staff:             'Staff',
}