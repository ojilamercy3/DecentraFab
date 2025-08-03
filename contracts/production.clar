;; Production Smart Contract

;; ----------------------------
;; Constants and Error Codes
;; ----------------------------

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-JOB-NOT-FOUND u101)
(define-constant ERR-JOB-ALREADY-CLAIMED u102)
(define-constant ERR-JOB-NOT-CLAIMED u103)
(define-constant ERR-NOT-MANUFACTURER u104)
(define-constant ERR-JOB-ALREADY-COMPLETED u105)
(define-constant ERR-JOB-NOT-YOURS u106)

(define-constant JOB-STATUS-PENDING u0)
(define-constant JOB-STATUS-CLAIMED u1)
(define-constant JOB-STATUS-COMPLETED u2)
(define-constant JOB-STATUS-LATE u3)

;; ----------------------------
;; Data Structures
;; ----------------------------

(define-data-var admin principal tx-sender)
(define-data-var job-id-counter uint u0)

(define-map jobs
  uint
  {
    creator: principal,
    description: (string-ascii 100),
    deadline: uint,
    penalty: uint,
    assigned-to: (optional principal),
    status: uint,
    created-at: uint,
    claimed-at: (optional uint),
    completed-at: (optional uint)
  }
)

;; ----------------------------
;; Private Helpers
;; ----------------------------

(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

(define-private (get-block-height)
  block-height
)

;; ----------------------------
;; Public Functions
;; ----------------------------

(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)

(define-public (create-job (description (string-ascii 100)) (deadline uint) (penalty uint))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))

    (let ((job-id (var-get job-id-counter)))
      (map-set jobs job-id {
        creator: tx-sender,
        description: description,
        deadline: deadline,
        penalty: penalty,
        assigned-to: none,
        status: JOB-STATUS-PENDING,
        created-at: (get-block-height),
        claimed-at: none,
        completed-at: none
      })
      (var-set job-id-counter (+ job-id u1))
      (ok job-id)
    )
  )
)

(define-public (claim-job (job-id uint))
  (match (map-get? jobs job-id)
    job
      (begin
        (asserts! (is-eq (get status job) JOB-STATUS-PENDING) (err ERR-JOB-ALREADY-CLAIMED))
        (map-set jobs job-id (merge job {
          assigned-to: (some tx-sender),
          claimed-at: (some (get-block-height)),
          status: JOB-STATUS-CLAIMED
        }))
        (ok true)
      )
    (err ERR-JOB-NOT-FOUND)
  )
)

(define-public (complete-job (job-id uint))
  (match (map-get? jobs job-id)
    job
      (begin
        (asserts! (is-eq (get status job) JOB-STATUS-CLAIMED) (err ERR-JOB-NOT-CLAIMED))
        (asserts! (is-eq (get assigned-to job) (some tx-sender)) (err ERR-JOB-NOT-YOURS))
        (let (
          (now (get-block-height))
          (deadline (+ (get created-at job) (get deadline job)))
          (is-late (> now deadline))
          (new-status (if is-late JOB-STATUS-LATE JOB-STATUS-COMPLETED))
        )
          (map-set jobs job-id (merge job {
            completed-at: (some now),
            status: new-status
          }))
          (ok new-status)
        )
      )
    (err ERR-JOB-NOT-FOUND)
  )
)

;; ----------------------------
;; Read-Only Functions
;; ----------------------------

(define-read-only (get-job (job-id uint))
  (match (map-get? jobs job-id)
    job (ok job)
    (err ERR-JOB-NOT-FOUND)
  )
)

(define-read-only (get-job-status (job-id uint))
  (match (map-get? jobs job-id)
    job (ok (get status job))
    (err ERR-JOB-NOT-FOUND)
  )
)

(define-read-only (get-admin)
  (ok (var-get admin))
)

(define-read-only (get-job-counter)
  (ok (var-get job-id-counter))
)
