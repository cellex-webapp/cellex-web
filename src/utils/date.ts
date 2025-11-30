import moment from 'moment-timezone'

/**
 * Format ISO date string (UTC) thành "Tháng X, Năm YYYY" theo múi giờ Việt Nam (GMT+7)
 * @param date - Chuỗi ngày hoặc đối tượng Date
 * @returns Ví dụ: "Tháng 11, Năm 2025"
 */
export const formatMonthYear = (date?: string | Date): string => {
  if (!date) return ''
  return moment(date)
    .tz('Asia/Ho_Chi_Minh')
    .format('[Tháng] M, [Năm] YYYY')
}

/**
 * Format chung (có thể tùy chỉnh pattern)
 * @param date - Chuỗi ngày hoặc đối tượng Date
 * @param format - Định dạng mong muốn (VD: 'DD/MM/YYYY HH:mm:ss')
 * @returns Chuỗi ngày giờ format theo VN time
 */
export const formatDateVN = (
  date?: string | Date,
  format: string = 'DD/MM/YYYY HH:mm:ss'
): string => {
  if (!date) return ''
  return moment(date).tz('Asia/Ho_Chi_Minh').format(format)
}
