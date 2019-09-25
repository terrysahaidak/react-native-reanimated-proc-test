import React from 'react';
import A, {Easing} from 'react-native-reanimated';

interface AnimationValues {
  [key: string]: A.Value<number>;
}

interface Props<T> {
  values: T;
  dest: {[K in keyof T]: number};
}

interface IRunTiming {
  clock: A.Clock;
  duration: number;
  value: A.Value<number>;
  dest: A.Adaptable<number>;
  easing?: A.EasingFunction;
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

  return A.block([
    A.cond(A.clockRunning(clock), 0, [
      A.block([
        A.set(state.finished, 0),
        A.set(state.time, 0),
        A.set(state.position, value),
        A.set(state.frameTime, 0),
        A.set(config.toValue, dest),
      ]),
    ]),
    A.cond(A.clockRunning(clock), 0, A.startClock(clock)),
    A.timing(clock, state, config),
    A.cond(state.finished, A.stopClock(clock)),
    A.set(value, state.position),
  ]);
};

export default function useTiming<TAnimationValues extends AnimationValues>(
  props: Props<TAnimationValues>,
): A.Node<number> {
  const keys = Object.keys(props.values);

  const animation = React.useMemo<A.Node<number>[]>(() => {
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
      [] as A.Node<number>[],
    );
  }, []);

  return A.block(animation);
}
