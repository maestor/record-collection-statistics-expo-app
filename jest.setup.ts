const { act, cleanup } = require("@testing-library/react-native");
const { notifyManager } = require("@tanstack/react-query");

notifyManager.setScheduler((callback: () => void) => callback());
notifyManager.setNotifyFunction((callback: () => void) => {
  act(callback);
});

afterEach(() => {
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
    Image: ({ accessibilityLabel, style, testID }: { accessibilityLabel?: string; style?: unknown; testID?: string }) =>
      React.createElement(View, { accessibilityLabel, style, testID }),
  };
});

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  function Link({
    asChild,
    children,
    ...props
  }: {
    asChild?: boolean;
    children: React.ReactElement | React.ReactNode;
  }) {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }

    return React.createElement(Text, props, children);
  }

  function Shell({ children }: React.PropsWithChildren) {
    return React.createElement(React.Fragment, null, children);
  }

  function Screen() {
    return null;
  }

  Link.displayName = "MockLink";
  Shell.displayName = "MockRouterShell";
  Screen.displayName = "MockRouterScreen";
  Shell.Screen = Screen;

  return {
    Link,
    Stack: Shell,
    Tabs: Shell,
    useLocalSearchParams: jest.fn(() => ({})),
    useRouter: jest.fn(() => ({
      push: jest.fn(),
    })),
  };
});
