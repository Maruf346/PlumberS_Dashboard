const REPORT_TYPE_PREFIX = 'report_type:'
const CUSTOM_REPORT_PREFIX = 'custom_report:'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

export function encodeReportTypeId(id) {
  return `${REPORT_TYPE_PREFIX}${id}`
}

export function encodeCustomReportId(id) {
  return `${CUSTOM_REPORT_PREFIX}${id}`
}

export function makeReportSelectionValue(reportTypeIds = [], customReportIds = []) {
  return [
    ...reportTypeIds.filter(Boolean).map(encodeReportTypeId),
    ...customReportIds.filter(Boolean).map(encodeCustomReportId),
  ]
}

export function splitReportSelectionValue(values = []) {
  return values.reduce((acc, value) => {
    if (value.startsWith(REPORT_TYPE_PREFIX)) {
      acc.report_type_ids.push(value.slice(REPORT_TYPE_PREFIX.length))
    } else if (value.startsWith(CUSTOM_REPORT_PREFIX)) {
      acc.custom_report_ids.push(value.slice(CUSTOM_REPORT_PREFIX.length))
    }
    return acc
  }, { report_type_ids: [], custom_report_ids: [] })
}

export function makeReportOptions(reportTypes = [], customReports = []) {
  return [
    ...reportTypes.map(report => ({
      value: encodeReportTypeId(report.value),
      label: report.label,
    })),
    ...customReports.map((report, index) => ({
      value: encodeCustomReportId(report.id),
      label: report.name,
      groupLabel: 'Custom Reports',
      dividerBefore: index === 0,
    })),
  ]
}

export function getDefaultCustomReportIds(customReports = []) {
  const match = customReports.find(report =>
    report.name?.trim().toLowerCase() === 'disconnect/reconnect report'
  )
  return match?.id ? [match.id] : []
}

export function getAssignedReportTypeIds(job = {}) {
  return asArray(job.reports)
    .map(report => typeof report === 'string' ? report : report.report_type)
    .filter(Boolean)
}

export function getAssignedCustomReportIds(job = {}) {
  return asArray(job.custom_reports)
    .map(report => {
      if (typeof report === 'string') return report
      return report.id ?? report.custom_report_id ?? report.custom_report?.id ?? report.template?.id
    })
    .filter(Boolean)
}
