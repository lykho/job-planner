import { UnknownJobTypeError, NotJobError } from '../src';

describe('Error', () => {
  test('NotJobError should display right message', () => {
    const e = new NotJobError();
    expect(e.message).toEqual('Passed object is not a job');
  });

  test('UnknownJobTypeError should display right message', () => {
    const e = new UnknownJobTypeError();
    expect(e.message).toEqual(
      'Passed object is job but represents unknown type'
    );
  });
});
