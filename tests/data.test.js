console.assert(
    Array.isArray(jobs),
    "FAIL: jobs should be an array"
);

console.assert(
    jobs.length === 6,
    "FAIL: expected six sample jobs"
);

console.assert(
    jobs.every(job => Number.isInteger(job.id)),
    "FAIL: every job should have an integer ID"
);

console.assert(
    new Set(jobs.map(job => job.id)).size === jobs.length,
    "FAIL: job IDs should be unique"
);

console.assert(
    jobs.every(job => job.title && job.company),
    "FAIL: every job should have a title and company"
);

console.log("Basic job data checks completed.");