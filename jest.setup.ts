/* eslint-disable @typescript-eslint/no-require-imports */
const { act, cleanup } = require("@testing-library/react-native");
const { notifyManager } = require("@tanstack/react-query");

notifyManager.setScheduler((callback: () => void) => callback());
notifyManager.setNotifyFunction((callback: () => void) => {
  act(callback);
});

afterEach(() => {
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;

  void AsyncStorage.clear();
  cleanup();
});

jest.mock("expo-constants", () => {
  const constants = {
    expoConfig: {
      extra: {},
    },
    manifest: {
      extra: {},
    },
  };

  return {
    __esModule: true,
    default: constants,
  };
});

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Image: ({
      accessibilityLabel,
      style,
      testID,
    }: {
      accessibilityLabel?: string;
      style?: unknown;
      testID?: string;
    }) => React.createElement(View, { accessibilityLabel, style, testID }),
  };
});

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    GestureHandlerRootView: ({
      children,
      style,
    }: React.PropsWithChildren<{ style?: unknown }>) =>
      React.createElement(View, { style }, children),
  };
});

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");

  return {
    SafeAreaProvider: ({ children }: React.PropsWithChildren) =>
      React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: jest.fn(() => ({
      bottom: 13,
      left: 0,
      right: 0,
      top: 11,
    })),
  };
});

jest.mock("react-native-gifted-charts", () => {
  const React = require("react");
  const { View } = require("react-native");

  const createChart = (displayName: string) => {
    const Chart = ({
      accessibilityLabel,
      centerLabelComponent,
      data,
      focusedPieIndex,
      testID,
    }: {
      accessibilityLabel?: string;
      centerLabelComponent?: ((selectedIndex?: number) => React.ReactNode) | undefined;
      data?: unknown;
      focusedPieIndex?: number;
      testID?: string;
    }) =>
      React.createElement(
        View,
        {
          accessibilityLabel,
          data,
          testID,
        },
        centerLabelComponent ? centerLabelComponent(focusedPieIndex ?? 0) : null,
      );

    Chart.displayName = displayName;

    return Chart;
  };

  return {
    BarChart: createChart("MockBarChart"),
    LineChart: createChart("MockLineChart"),
    PieChart: createChart("MockPieChart"),
  };
});

jest.mock("@react-native-async-storage/async-storage", () => {
  const storage = new Map<string, string>();

  return {
    __esModule: true,
    default: {
      clear: jest.fn(async () => {
        storage.clear();
      }),
      getItem: jest.fn(async (key: string) => storage.get(key) ?? null),
      removeItem: jest.fn(async (key: string) => {
        storage.delete(key);
      }),
      setItem: jest.fn(async (key: string, value: string) => {
        storage.set(key, value);
      }),
    },
  };
});

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Link = ({
    asChild,
    children,
    ...props
  }: {
    asChild?: boolean;
    children: React.ReactElement | React.ReactNode;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }

    return React.createElement(Text, props, children);
  };

  const Shell = ({ children }: React.PropsWithChildren) =>
    React.createElement(React.Fragment, null, children);

  const Screen = () => null;

  const Stack = Object.assign(Shell, {
    Screen: jest.fn(Screen),
    displayName: "MockStack",
  });
  const Tabs = Object.assign(Shell, {
    Screen: jest.fn(Screen),
    displayName: "MockTabs",
  });

  Link.displayName = "MockLink";
  Screen.displayName = "MockRouterScreen";

  return {
    Link,
    Stack,
    Tabs,
    useLocalSearchParams: jest.fn(() => ({})),
    useRouter: jest.fn(() => ({
      push: jest.fn(),
    })),
  };
});
