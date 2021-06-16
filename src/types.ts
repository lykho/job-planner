// Function that will be called from Scheduler. Every Job contains one or more Processes.
export type Process = (...data: any[]) => Promise<any> | any;

export enum JOB_TYPES {
  sync = 'sync',
  parallel = 'parallel',
}

// Job - utility entity that contains processes and represents in which order call them.
export interface Job {
  _isJob: true;
  type: JOB_TYPES;
  processes: (Process | Job)[];
}

// Job which processes will be called one by one.
export interface SyncJob extends Job {
  type: JOB_TYPES.sync;
}

// Job which processes will be called simultaneously.
export interface ParallelJob extends Job {
  type: JOB_TYPES.parallel;
}

// Helper that creates Sync Job utility object.
// All job processes will be run in sync, one after another.
export type Sync = (...processes: (Process | Job)[]) => SyncJob;

// Helper that creates Parallel Job utility object.
// All job processes will be run simultaneously.
export type Parallel = (...processes: (Process | Job)[]) => ParallelJob;

// Helper that provides a plan in which order and how passed processes will be called by wrapping them into Jobs.
export type PlanCreator = ({
  sync,
  parallel,
}: {
  sync: Sync;
  parallel: Parallel;
}) => Job;

export interface Config {
  // Function that handles how to execute provided processes.
  executor?(process: any): Promise<any> | any;

  stopOnError?: boolean;

  errorHandler?(error: Error): void;
}
