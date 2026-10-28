/**
 * feature 여러 곳에서 공유하는 도메인 타입.
 * feature끼리 서로 import 하지 않도록(home ← reports 같은 역참조 방지) 여기로 올린다.
 */

export type InspectionCycle = '월차' | '분기' | '반기' | '연차'

export type ReportStatus = '점검중' | '검토중' | '재점검' | '완료'

/** 점검 대상 1건 */
export interface Inspection {
  id: string
  siteName: string
  region: string
  /** yyyy-MM-dd */
  dueDate: string
  /** '이번 달 3/4차' 의 3/4 부분 */
  round: string
  cycle: InspectionCycle
}

/** 시작했지만 아직 제출하지 않은 점검 */
export interface OngoingInspection extends Inspection {
  /** yyyy-MM-dd */
  startedAt: string
  /** HH:mm — '14:32 저장' */
  savedAt: string
}

export interface Report {
  id: string
  siteName: string
  /** yyyy-MM-dd */
  date: string
  status: ReportStatus
}
