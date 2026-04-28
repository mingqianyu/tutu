import dayjs from 'dayjs'

/**
 * 计算月龄
 * @param birthday 出生日期（YYYY-MM-DD 格式）
 * @returns 月龄描述，如 "6个月15天"
 */
export function getMonthAge(birthday: string): string {
  const birth = dayjs(birthday)
  const now = dayjs()

  const years = now.diff(birth, 'year')
  const months = now.diff(birth, 'month')
  const remainingDays = now.diff(birth.add(months, 'month'), 'day')

  if (years >= 1) {
    const remainingMonths = months - years * 12
    if (remainingMonths > 0) {
      return `${years}岁${remainingMonths}个月`
    }
    return `${years}岁`
  }

  if (months > 0) {
    if (remainingDays > 0) {
      return `${months}个月${remainingDays}天`
    }
    return `${months}个月`
  }

  return `${remainingDays}天`
}

/**
 * 获取月龄数值（用于 baby-changes.json 索引）
 * @param birthday 出生日期
 * @returns 月龄数值（0-12）
 */
export function getMonthAgeNumber(birthday: string): number {
  const birth = dayjs(birthday)
  const now = dayjs()
  const months = now.diff(birth, 'month')
  return Math.min(months, 12)
}
