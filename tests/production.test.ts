import { describe, it, expect, beforeEach } from "vitest"

type JobStatus = 0 | 1 | 2 | 3 // pending, claimed, completed, late

interface Job {
  creator: string
  description: string
  deadline: number
  penalty: number
  assignedTo?: string
  status: JobStatus
  createdAt: number
  claimedAt?: number
  completedAt?: number
}

interface MockContract {
  admin: string
  blockHeight: number
  jobIdCounter: number
  jobs: Map<number, Job>

  isAdmin(caller: string): boolean
  incrementBlock(): void
  createJob(caller: string, description: string, deadline: number, penalty: number): { value?: number; error?: number }
  claimJob(caller: string, jobId: number): { value?: boolean; error?: number }
  completeJob(caller: string, jobId: number): { value?: JobStatus; error?: number }
  getJob(jobId: number): Job | undefined
}

const ERR = {
  NOT_AUTHORIZED: 100,
  JOB_NOT_FOUND: 101,
  JOB_ALREADY_CLAIMED: 102,
  JOB_NOT_CLAIMED: 103,
  NOT_MFG: 104,
  JOB_ALREADY_COMPLETED: 105,
  JOB_NOT_YOURS: 106,
}

const STATUS = {
  PENDING: 0,
  CLAIMED: 1,
  COMPLETED: 2,
  LATE: 3,
} as const

let mockContract: MockContract

beforeEach(() => {
  mockContract = {
    admin: "ST1ADMIN",
    blockHeight: 1000,
    jobIdCounter: 0,
    jobs: new Map(),

    isAdmin(caller) {
      return caller === this.admin
    },

    incrementBlock() {
      this.blockHeight++
    },

    createJob(caller, description, deadline, penalty) {
      if (!this.isAdmin(caller)) return { error: ERR.NOT_AUTHORIZED }
      const jobId = this.jobIdCounter++
      this.jobs.set(jobId, {
        creator: caller,
        description,
        deadline,
        penalty,
        status: STATUS.PENDING,
        createdAt: this.blockHeight,
      })
      return { value: jobId }
    },

    claimJob(caller, jobId) {
      const job = this.jobs.get(jobId)
      if (!job) return { error: ERR.JOB_NOT_FOUND }
      if (job.status !== STATUS.PENDING) return { error: ERR.JOB_ALREADY_CLAIMED }

      job.status = STATUS.CLAIMED
      job.claimedAt = this.blockHeight
      job.assignedTo = caller
      return { value: true }
    },

    completeJob(caller, jobId) {
      const job = this.jobs.get(jobId)
      if (!job) return { error: ERR.JOB_NOT_FOUND }
      if (job.status !== STATUS.CLAIMED) return { error: ERR.JOB_NOT_CLAIMED }
      if (job.assignedTo !== caller) return { error: ERR.JOB_NOT_YOURS }

      const deadlineBlock = job.createdAt + job.deadline
      const isLate = this.blockHeight > deadlineBlock
      job.completedAt = this.blockHeight
      job.status = isLate ? STATUS.LATE : STATUS.COMPLETED

      return { value: job.status }
    },

    getJob(jobId) {
      return this.jobs.get(jobId)
    },
  }
})

describe("Production Contract Mock", () => {
  const manufacturer = "ST2MFG"
  const anotherMfg = "ST3OTHER"

  it("should allow admin to create jobs", () => {
    const result = mockContract.createJob(mockContract.admin, "Make widget", 5, 100)
    expect(result.value).toBe(0)
    const job = mockContract.getJob(0)
    expect(job?.description).toBe("Make widget")
    expect(job?.status).toBe(STATUS.PENDING)
  })

  it("should block non-admins from creating jobs", () => {
    const result = mockContract.createJob(manufacturer, "Illegal job", 5, 100)
    expect(result.error).toBe(ERR.NOT_AUTHORIZED)
  })

  it("should allow job claim if pending", () => {
    mockContract.createJob(mockContract.admin, "Make widget", 5, 100)
    const result = mockContract.claimJob(manufacturer, 0)
    expect(result.value).toBe(true)
    const job = mockContract.getJob(0)
    expect(job?.assignedTo).toBe(manufacturer)
    expect(job?.status).toBe(STATUS.CLAIMED)
  })

  it("should reject claim on non-pending jobs", () => {
    mockContract.createJob(mockContract.admin, "Do X", 5, 100)
    mockContract.claimJob(manufacturer, 0)
    const result = mockContract.claimJob(anotherMfg, 0)
    expect(result.error).toBe(ERR.JOB_ALREADY_CLAIMED)
  })

  it("should allow job completion before deadline", () => {
    mockContract.createJob(mockContract.admin, "Quick build", 3, 50)
    mockContract.claimJob(manufacturer, 0)
    mockContract.incrementBlock() // 1001
    mockContract.incrementBlock() // 1002
    const result = mockContract.completeJob(manufacturer, 0)
    expect(result.value).toBe(STATUS.COMPLETED)
  })

  it("should mark job as late if completed after deadline", () => {
    mockContract.createJob(mockContract.admin, "Late delivery", 2, 80)
    mockContract.claimJob(manufacturer, 0)
    mockContract.incrementBlock() // 1001
    mockContract.incrementBlock() // 1002
    mockContract.incrementBlock() // 1003 (past deadline)
    const result = mockContract.completeJob(manufacturer, 0)
    expect(result.value).toBe(STATUS.LATE)
  })

  it("should reject completion if not claimed", () => {
    mockContract.createJob(mockContract.admin, "Unclaimed", 3, 10)
    const result = mockContract.completeJob(manufacturer, 0)
    expect(result.error).toBe(ERR.JOB_NOT_CLAIMED)
  })

  it("should reject completion by non-assignee", () => {
    mockContract.createJob(mockContract.admin, "Unauthorized attempt", 5, 10)
    mockContract.claimJob(manufacturer, 0)
    const result = mockContract.completeJob(anotherMfg, 0)
    expect(result.error).toBe(ERR.JOB_NOT_YOURS)
  })
})
