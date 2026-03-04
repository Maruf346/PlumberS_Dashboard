// src/data/formOptions.js
// Shared select option arrays used by CreateJobPage and EditJobPage.
// When API is integrated replace these with fetched data.
// ─────────────────────────────────────────────────────────────────────────────

export const SAFETY_OPTIONS = [
  { value: 'standard',   label: 'Standard Safety Protocol'   },
  { value: 'enhanced',   label: 'Enhanced Safety Protocol'   },
  { value: 'confined',   label: 'Confined Space Entry'       },
  { value: 'electrical', label: 'Electrical Hazard Protocol' },
  { value: 'chemical',   label: 'Chemical Handling Protocol' },
]

export const INSURED_OPTIONS = [
  { value: 'apex',        label: 'Apex Industries'      },
  { value: 'city-center', label: 'City Center Mall'     },
  { value: 'westside',    label: 'Westside Apartments'  },
  { value: 'harbor',      label: 'Harbor Warehouse'     },
  { value: 'techpark',    label: 'Tech Park'            },
  { value: 'grand-hotel', label: 'Grand Hotel'          },
  { value: 'metro',       label: 'Metro Station'        },
  { value: 'riverside',   label: 'Riverside Medical'    },
  { value: 'summit',      label: 'Summit Tower'         },
  { value: 'airport',     label: 'Airport Terminal B'   },
  { value: 'university',  label: 'University Science Block' },
  { value: 'bayview',     label: 'Bayview Marina'       },
]

export const CONTACT_OPTIONS = [
  { value: 'robert-chen',   label: 'Robert Chen — +1 (212) 555-0182'   },
  { value: 'james-wu',      label: 'James Wu — +1 (212) 555-0193'      },
  { value: 'linda-alvarez', label: 'Linda Alvarez — +1 (212) 555-0207' },
  { value: 'tony-marsh',    label: 'Tony Marsh — +1 (212) 555-0241'    },
  { value: 'anna-scott',    label: 'Anna Scott — +1 (212) 555-0259'    },
  { value: 'ben-walsh',     label: 'Ben Walsh — +1 (212) 555-0274'     },
]

export const MANAGER_OPTIONS = [
  { value: 'sarah-lee',  label: 'Sarah Lee'  },
  { value: 'david-kim',  label: 'David Kim'  },
  { value: 'emily-chen', label: 'Emily Chen' },
  { value: 'tom-baker',  label: 'Tom Baker'  },
]

export const STAFF_OPTIONS = [
  { value: 'mike-ross',  label: 'Mike Ross'  },
  { value: 'john-doe',   label: 'John Doe'   },
  { value: 'lisa-park',  label: 'Lisa Park'  },
  { value: 'chris-hall', label: 'Chris Hall' },
  { value: 'nina-webb',  label: 'Nina Webb'  },
  { value: 'james-ford', label: 'James Ford' },
]

export const STATUS_OPTIONS = [
  { value: 'Pending',     label: 'Pending'     },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed',   label: 'Completed'   },
  { value: 'Overdue',     label: 'Overdue'     },
]

export const PRIORITY_OPTIONS = [
  { value: 'High',   label: 'High'   },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low',    label: 'Low'    },
]

export const VEHICLE_OPTIONS = [
  { value: 'Van-01',   label: 'Van-01 (Ford Transit)'    },
  { value: 'Van-02',   label: 'Van-02 (Ford Transit)'    },
  { value: 'Van-03',   label: 'Van-03 (Mercedes Sprinter)' },
  { value: 'Van-04',   label: 'Van-04 (Ford Transit)'    },
  { value: 'Van-05',   label: 'Van-05 (Mercedes Sprinter)' },
  { value: 'Truck-01', label: 'Truck-01 (Chevy Silverado)' },
  { value: 'Truck-02', label: 'Truck-02 (Ford F-150)'    },
  { value: 'Truck-03', label: 'Truck-03 (Ram 1500)'      },
  { value: 'Truck-04', label: 'Truck-04 (Ford F-250)'    },
  { value: 'Truck-05', label: 'Truck-05 (Chevy Silverado)' },
]

// ── Helper: resolve a job's raw field values to select option values ──────────
// The mock data stores human-readable labels (e.g. "Sarah Lee").
// These helpers convert them to option value keys for controlled <select>.

export function managerToValue(name) {
  return MANAGER_OPTIONS.find(o => o.label === name)?.value ?? ''
}

export function staffToValue(name) {
  return STAFF_OPTIONS.find(o => o.label === name)?.value ?? ''
}

export function clientToInsuredValue(client) {
  return INSURED_OPTIONS.find(o => o.label === client)?.value ?? ''
}
