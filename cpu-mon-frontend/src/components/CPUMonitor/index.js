// This is the container that connects to Redux and holds the CPULoadChart

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { fetchCPU, selectCPUState, togglePolling } from "./cpuSlice";
import CPULoadChart from "./CPULoadChart";

const POLLING_INTERVAL_RATE = 10000;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 30px;
`;
const Title = styled.h1`
  margin-right: 20px;
`;
const StatusText = styled.h2`
  margin-right: 20px;
  margin: 0px;
`;
const Body = styled.div`
  display: flex;
  flex-direction: column;
`;
const PollButton = styled.button`
  height: 35px;
  border-radius: 7px;
  border: none;
  margin-right: 20px;
`;

export default function CPUMonitor() {
  const dispatch = useDispatch();
  const cpuState = useSelector(selectCPUState);
  const pollingInterval = useRef(null);

  // Toggle Polling
  useEffect(() => {
    if (cpuState.isPolling) {
      dispatch(fetchCPU());
      pollingInterval.current = setInterval(() => {
        dispatch(fetchCPU());
      }, POLLING_INTERVAL_RATE);
    } else {
      clearInterval(pollingInterval.current);
    }
    return () => clearInterval(pollingInterval.current);
  }, [cpuState.isPolling, dispatch]);

  return (
    <Body>
      <Row>
        <Title>CPU-Monitor</Title>
        <PollButton
          onClick={() => {
            dispatch(togglePolling());
          }}
        >
          {cpuState.isPolling ? "Stop" : "Start"}
        </PollButton>
      </Row>
      <Row>
        <StatusText>
          Polling Status:{" "}
          {cpuState.error
            ? `Error ⚠️ ${cpuState.error}`
            : cpuState.isPolling
            ? "Running 🏃"
            : "Paused ⏸️"}
        </StatusText>
      </Row>
      <Row>
        <StatusText>
          CPU Status: {cpuState.heavyLoad ? "⚠️ Heavy CPU Load" : "✅"}
        </StatusText>
      </Row>
      <CPULoadChart data={cpuState.loadValues} />
    </Body>
  );
}
