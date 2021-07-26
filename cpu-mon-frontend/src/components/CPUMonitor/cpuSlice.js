import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const HEAVY_LOAD_WINDOW = 12;
const HEAVY_LOAD_THRESHOLD = 1;

// Polling Thunk
export const fetchCPU = createAsyncThunk(
  "fetchCPU",
  async (args, thunkAPI) => {
    const response = await fetch(process.env.REACT_APP_CPU_MON_BACKEND);
    const data = await response.json();
    return data.cpuLoad;
  },
  // Exit if another request has already been made or not isPolling
  {
    condition: (args, { getState }) => {
      if (getState().cpu.waitingForPoll || !getState().cpu.isPolling) {
        return false;
      }
    },
  }
);

export const cpuSlice = createSlice({
  name: "cpu",
  initialState: {
    loadValues: [],
    waitingForPoll: false,
    isPolling: false,
    heavyLoad: false,
  },
  reducers: {
    togglePolling: (state) => {
      state.isPolling = !state.isPolling;
      if (!state.isPolling) {
        document.title = "⏸️ CPU Polling Paused";
      } else {
        document.title = "🏃 CPU Polling Running";
      }
    },
  },
  extraReducers: {
    [fetchCPU.pending]: (state, action) => {
      state.waitingForPoll = true;
    },
    [fetchCPU.fulfilled]: (state, action) => {
      if (action.payload !== false) {
        // Include slightly more than 60 as they slide off frame
        if (state.loadValues.length >= 60 + 3) {
          state.loadValues.shift();
        }
        state.loadValues.push({ value: action.payload, time: Date.now() });
        state.waitingForPoll = false;
      }

      // Calculate and mark windows of heavy CPU load
      if (state.loadValues.length >= HEAVY_LOAD_WINDOW) {
        let heavyLoad = true;
        let maintainHeavyLoad = false;
        for (
          let i = state.loadValues.length - 1;
          i >= state.loadValues.length - HEAVY_LOAD_WINDOW;
          i--
        ) {
          if (state.loadValues[i].value < HEAVY_LOAD_THRESHOLD) {
            heavyLoad = false;
          }

          if (
            state.loadValues[i].value >= HEAVY_LOAD_THRESHOLD &&
            state.heavyLoad
          ) {
            maintainHeavyLoad = true;
          }
        }
        if (heavyLoad || maintainHeavyLoad) {
          for (
            let i = state.loadValues.length - 1;
            i >= state.loadValues.length - HEAVY_LOAD_WINDOW;
            i--
          ) {
            state.loadValues[i].heavyLoad = true;
          }
          state.heavyLoad = true;
          document.title = "⚠️ WARNING Heavy CPU Load";
        } else {
          state.heavyLoad = false;
          document.title = "✅ CPU Load Normal";
        }
      }
    },
    [fetchCPU.rejected]: (state, action) => {
      state.waitingForPoll = false;
      state.isPolling = false;
      state.error = action.error.message;
    },
  },
});

export const { togglePolling } = cpuSlice.actions;

export const selectCPUState = (state) => state.cpu;

export default cpuSlice.reducer;
