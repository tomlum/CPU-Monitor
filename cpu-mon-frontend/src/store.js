import { configureStore } from "@reduxjs/toolkit";
import cpuReducer from "./components/CPUMonitor/cpuSlice";

export default configureStore({
  reducer: {
    cpu: cpuReducer,
  },
});
