import cpuReducer, { fetchCPU, togglePolling } from "./cpuSlice";
describe("cpu reducer", () => {
  describe("basic/polling actions", () => {
    it("should handle initial state", () => {
      expect(cpuReducer(undefined, {})).toEqual({
        loadValues: [],
        waitingForPoll: false,
        isPolling: false,
        heavyLoad: false,
      });
    });

    it("marks waitingForPoll on a pending fetchCPU", () => {
      expect(
        cpuReducer(undefined, {
          type: fetchCPU.pending,
        })
      ).toEqual({
        isPolling: false,
        loadValues: [],
        waitingForPoll: true,
        heavyLoad: false,
      });
    });

    it("toggles isPolling", () => {
      expect(
        cpuReducer(
          { isPolling: true },
          {
            type: togglePolling,
          }
        )
      ).toEqual({ isPolling: false });

      expect(
        cpuReducer(
          { isPolling: false },
          {
            type: togglePolling,
          }
        )
      ).toEqual({ isPolling: true });
    });

    it("sets an error on a rejected fetchCPU and turns off polling & waitingForPoll", () => {
      expect(
        cpuReducer(
          { isPolling: true, loadValues: [], waitingForPoll: true },
          {
            type: fetchCPU.rejected,
            error: { message: "test error" },
          }
        )
      ).toEqual({
        isPolling: false,
        loadValues: [],
        waitingForPoll: false,
        error: "test error",
      });
    });
  });

  describe("determining heavyLoad", () => {
    it("does NOT mark heavyLoad when not enough heavy values have been recorded", () => {
      const loadValues = [];
      for (let i = 0; i < 5; i++) {
        loadValues.push({ value: 0.5 });
      }
      for (let i = 0; i < 10; i++) {
        loadValues.push({ value: 2 });
      }
      expect(
        cpuReducer(
          {
            isPolling: true,
            loadValues,
            waitingForPoll: true,
            heavyLoad: false,
          },
          {
            type: fetchCPU.fulfilled,
            payload: 1,
          }
        ).heavyLoad
      ).toBe(false);
    });

    it("marks heavyLoad when enough heavy values have been recorded", () => {
      const loadValues = [];
      for (let i = 0; i < 5; i++) {
        loadValues.push({ value: 0.5 });
      }
      for (let i = 0; i < 11; i++) {
        loadValues.push({ value: 2 });
      }
      expect(
        cpuReducer(
          {
            isPolling: true,
            loadValues,
            waitingForPoll: true,
            heavyLoad: false,
          },
          {
            type: fetchCPU.fulfilled,
            payload: 1,
          }
        ).heavyLoad
      ).toBe(true);
    });

    it("maintains heavyLoad if insufficient low loads have arrived", () => {
      const loadValues = [];
      for (let i = 0; i < 12; i++) {
        loadValues.push({ value: 2, heavyLoad: true });
      }
      for (let i = 0; i < 5; i++) {
        loadValues.push({ value: 0, heavyLoad: true });
      }
      expect(
        cpuReducer(
          {
            isPolling: true,
            loadValues,
            waitingForPoll: true,
            heavyLoad: true,
          },
          {
            type: fetchCPU.fulfilled,
            payload: 0,
          }
        ).heavyLoad
      ).toBe(true);
    });

    it("reverts heavyLoad when returning to a normal load", () => {
      const loadValues = [];
      for (let i = 0; i < 12; i++) {
        loadValues.push({ value: 2, heavyLoad: true });
      }
      for (let i = 0; i < 11; i++) {
        loadValues.push({ value: 0, heavyLoad: true });
      }
      expect(
        cpuReducer(
          {
            isPolling: true,
            loadValues,
            waitingForPoll: true,
            heavyLoad: true,
          },
          {
            type: fetchCPU.fulfilled,
            payload: 0,
          }
        ).heavyLoad
      ).toBe(false);
    });
  });
});
