import {
  Config,
  Job,
  JOB_TYPES,
  Parallel,
  PlanCreator,
  Process,
  Sync,
} from './types';
import { NotJobError, UnknownJobTypeError } from './errors';

export const sync: Sync = (...processes) => ({
  _isJob: true,
  type: JOB_TYPES.sync,
  processes,
});

export const parallel: Parallel = (...processes) => ({
  _isJob: true,
  type: JOB_TYPES.parallel,
  processes,
});

const defaultConfig: Config = {
  async executor(process: Process): Promise<any> {
    return process();
  },
  stopOnError: false,
  errorHandler(e: Error) {
    throw e;
  },
};

export function createPlan(planCreator: PlanCreator) {
  const plan = planCreator({ sync, parallel });

  return (config: Config = {}) => {
    const processor = getJobProcessor(plan);
    return processor(plan, { ...defaultConfig, ...config });
  };
}

function getJobProcessor(job: Job) {
  if (!job._isJob) throw new NotJobError();

  switch (job.type) {
    case JOB_TYPES.sync:
      return syncProcessor;
    case JOB_TYPES.parallel:
      return parallelProcessor;
    default:
      throw new UnknownJobTypeError();
  }
}

async function syncProcessor(job: Job, config: Config): Promise<void> {
  for (const process of job.processes) {
    if (typeof process === 'object' && process._isJob) {
      const processor = getJobProcessor(process);
      await processor(process, config);
      continue;
    }

    try {
      await config.executor!(process);
    } catch (e) {
      config.errorHandler!(e);
      if (config.stopOnError) {
        return;
      }
    }
  }
}

async function parallelProcessor(job: Job, config: Config): Promise<void> {
  const runningProcesses: Promise<any>[] = [];

  for (const process of job.processes) {
    if (typeof process === 'object' && process._isJob) {
      const processor = getJobProcessor(process);
      runningProcesses.push(processor(process, config));
      continue;
    }

    try {
      runningProcesses.push(config.executor!(process));
    } catch (e) {
      config.errorHandler!(e);
      if (config.stopOnError) {
        return;
      }
    }
  }

  await Promise.all(runningProcesses);
}
