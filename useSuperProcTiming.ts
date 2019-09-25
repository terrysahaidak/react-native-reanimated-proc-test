import React from 'react';
import A, {Easing} from 'react-native-reanimated';

interface AnimationValues {
  [key: string]: A.Value<number>;
}

interface Props<T> {
  values: T;
  dest: {[K in keyof T]: number};
}

const runTimingProc = A.proc((
  clock: A.Clock,
  // custom
  value: A.Value<number>,
  dest: A.Adaptable<number>,
  // state
  finished: A.Value<number>,
  position: A.Value<number>,
  time: A.Value<number>,
  frameTime: A.Value<number>,
  // config
  toValue: A.Value<number>,
  duration: A.Adaptable<number>,
) =>
  A.block([
    A.cond(
      A.clockRunning(clock),
      0,
      A.block([
        A.set(finished, 0),
        A.set(time, 0),
        A.set(position, value),
        A.set(frameTime, 0),
        A.set(toValue, dest),
      ]),
    ),
    A.cond(A.clockRunning(clock), 0, A.startClock(clock)),
    A.timing(
      clock,
      {
        finished,
        position,
        time,
        frameTime,
      },
      {
        toValue,
        duration,
        easing: Easing.linear,
      },
    ),
    A.cond(finished, A.stopClock(clock)),
    A.set(value, position),
  ]),
);

interface IRunTiming {
  clock?: A.Clock;
  oppositeClock?: A.Clock;
  duration: number;
  value: A.Value<number>;
  dest: A.Adaptable<number>;
  easing?: A.EasingFunction;
  onFinish?: any;
}

export const runTiming = ({
  clock,
  duration,
  value,
  dest,
  easing,
}: IRunTiming) => {
  const state = {
    finished: new A.Value(0),
    position: new A.Value(0),
    time: new A.Value(0),
    frameTime: new A.Value(0),
  };

  const config = {
    duration,
    toValue: new A.Value(0),
    easing: easing || Easing.inOut(Easing.ease),
  };

  return runTimingProc(
    clock,
    // custom
    value,
    dest,
    // state
    state.finished,
    state.position,
    state.time,
    state.frameTime,
    // config
    config.toValue,
    duration,
  );
};

export default function useTiming<TAnimationValues extends AnimationValues>(
  props: Props<TAnimationValues>,
): A.Node<number> {
  const keys = Object.keys(props.values);

  const animation = React.useMemo<A.Node<any>[]>(() => {
    return keys.reduce(
      (acc, key) => {
        const clock = new A.Clock();

        acc.push(
          runTiming({
            clock,
            duration: 2000,
            value: props.values[key],
            dest: props.dest[key],
          }),
        );

        return acc;
      },
      [] as A.Node<any>[],
    );
  }, []);

  return A.block(animation);
}
