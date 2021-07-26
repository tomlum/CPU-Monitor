import React from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { render } from "@testing-library/react";
import store from "../../store";
import CPULoadMonitor from "./index";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("CPUMonitor component", () => {
  it("should NOT alert of heavy cpu load when there is no heavyLoad", () => {
    useSelector.mockImplementation((callback) => {
      return callback({
        cpu: { isPolling: false, loadValues: [], heavyLoad: false },
      });
    });
    const { queryByText } = render(
      <Provider store={store}>
        <CPULoadMonitor />
      </Provider>
    );
    expect(queryByText(/✅/i)).toBeInTheDocument();
    expect(queryByText(/⚠️ Heavy CPU Load/i)).toBeNull();
  });

  it("should alert of heavy cpu load whenb there is heavyLoad", () => {
    useSelector.mockImplementation((callback) => {
      return callback({
        cpu: { isPolling: false, loadValues: [], heavyLoad: true },
      });
    });
    const { queryByText } = render(
      <Provider store={store}>
        <CPULoadMonitor />
      </Provider>
    );
    expect(queryByText(/⚠️ Heavy CPU Load/i)).toBeInTheDocument();
    expect(queryByText(/✅/i)).toBeNull();
  });
});
