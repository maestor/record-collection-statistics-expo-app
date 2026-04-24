const { act, cleanup } = require("@testing-library/react-native");
const { notifyManager } = require("@tanstack/react-query");

notifyManager.setScheduler((callback: () => void) => callback());
notifyManager.setNotifyFunction((callback: () => void) => {
  act(callback);
});

afterEach(() => {
  cleanup();
});

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();

  return {
    isAvailableAsync: jest.fn(async () => true),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    __resetStore: () => store.clear(),
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
  };
});
