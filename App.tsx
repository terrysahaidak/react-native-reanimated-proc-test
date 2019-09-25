import React from 'react';
import {StyleSheet, View, Dimensions, FlatList, Button} from 'react-native';
import A from 'react-native-reanimated';

// default animated slow timing
import useTiming from './useTiming';

// uncomment that to use enhanced proc timing which is faster
// import useTiming from './useProcTiming';

// uncomment that to use super-enhanced proc timing which is blazingly fast
// import useTiming from './useSuperProcTiming';

const {width: windowWidth} = Dimensions.get('window');

const colors = {
  red: '#e74c3c',
  white: 'white',
  green: '#2ecc71',
};

const s = StyleSheet.create({
  scroll: {
    paddingVertical: 20,
  },
  animationContainer: {
    height: 250,
    justifyContent: 'center',
  },
  animatableView: {
    backgroundColor: colors.red,
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
});

function Example() {
  const values = React.useMemo(
    () => ({
      width: new A.Value(50),
      height: new A.Value(50),
      left: new A.Value(20),
      borderRadius: new A.Value(0),
    }),
    [],
  );

  const timing = useTiming({
    values,
    dest: {
      width: 200,
      height: 200,
      left: windowWidth - 20 - 200,
      borderRadius: 100,
    },
  });

  A.useCode(timing, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center',
        marginBottom: 24,
      }}>
      <A.View style={[s.animatableView, values]} />
    </View>
  );
}

export default function App() {
  const [show, setShow] = React.useState(false);
  // performance test
  const range = Array.from(new Array(100));

  if (!show) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Button onPress={() => setShow(true)} title="Show" />
      </View>
    );
  }

  return (
    <FlatList
      data={range}
      initialNumToRender={100}
      contentContainerStyle={s.scroll}
      renderItem={() => <Example />}
      keyExtractor={(_, i) => i.toString()}
    />
  );
}
