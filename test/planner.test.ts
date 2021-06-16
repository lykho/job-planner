import { createPlan, Job, UnknownJobTypeError } from '../src';

const jobWithTimeout = (timeout: number, cb: Function) => () =>
  new Promise<void>(resolve =>
    setTimeout(() => {
      cb();
      resolve();
    }, timeout)
  );

describe('Planner', () => {
  test('Sync jobs must run one by one', async () => {
    const res: any[] = [];

    const planner = createPlan(({ sync }) =>
      sync(
        () => res.push(1),
        () => res.push(2),
        () => res.push(3)
      )
    );

    await planner();

    expect(res).toEqual([1, 2, 3]);
  });

  test('Parallel jobs must run simultaneously', async () => {
    const res: any[] = [];

    const planner = createPlan(({ parallel }) =>
      parallel(
        jobWithTimeout(1, () => res.push(1)),
        jobWithTimeout(3, () => res.push(3)),
        jobWithTimeout(2, () => res.push(2))
      )
    );

    await planner();

    expect(res.sort()).toEqual([1, 2, 3]);
  });

  test('Mixed behaviour without nested jobs', async () => {
    const res: any[] = [];

    const planner = createPlan(({ sync, parallel }) =>
      sync(
        sync(() => res.push(1)),
        parallel(
          jobWithTimeout(1, () => res.push(2)),
          jobWithTimeout(2, () => res.push(3))
        )
      )
    );

    await planner();

    expect(res.sort()).toEqual([1, 2, 3]);
  });

  test('Mixed behaviour with nested jobs', async () => {
    const res: any[] = [];

    const planner = createPlan(({ sync, parallel }) =>
      sync(
        () => res.push(1),
        sync(
          () => res.push(2),
          () => res.push(3)
        ),
        parallel(
          jobWithTimeout(1, () => res.push(5)),
          jobWithTimeout(2, () => res.push(6)),
          sync(() => res.push(4))
        )
      )
    );

    await planner();

    expect(res.sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('Executor provided in config should replace default executor', async () => {
    let res = false;

    const planner = createPlan(({ sync }) => sync(() => {}));

    await planner({
      executor(): Promise<unknown> {
        res = true;
        return Promise.resolve();
      },
    });

    await planner();

    expect(res).toBeTruthy();
  });

  test('Error should stop plan execution when stopOnError is set to true', async () => {
    const res: any[] = [];

    const planner = createPlan(({ sync }) =>
      sync(
        () => res.push(1),
        () => {
          throw new Error();
        },
        () => res.push(2)
      )
    );

    try {
      await planner();
    } catch (e) {}

    expect(res).toEqual([1]);
  });

  test('Error handler should be called when error occurs', async () => {
    const planner = createPlan(({ sync }) =>
      sync(() => {
        throw new Error();
      })
    );

    let res = false;

    await planner({
      errorHandler() {
        res = true;
      },
    });

    expect(res).toBeTruthy();
  });

  test('Unknown job type should cause error', async () => {
    const unknownJob = ({
      _isJob: true,
      type: 'Unknown',
    } as unknown) as Job;

    const planner = createPlan(() => unknownJob);

    expect(planner).toThrow(UnknownJobTypeError);
  });
});
