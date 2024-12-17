import { reportAPI } from '@/lib/report-api'

type ReportData = {
    appName: string
    startDate: string
    endDate: string
}

export const createReport = async (data: ReportData) => {
    const response = await reportAPI.post('/reports', { appName: data.appName, startDate: data.startDate, endDate: data.endDate })
    return response.data
}
