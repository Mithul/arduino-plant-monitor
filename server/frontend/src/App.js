/* App.js */

import React, { useState, useEffect } from 'react';
import Select from 'react-select'
import MoistureLightChart from './components/MoistureLightChart';
import SunlightChart from './components/SunlightChart';
import './styles/App.css';
import Container  from 'react-bootstrap/Container';
import { POLL_INTERVAL } from './constants';
import { useInterval } from './utils';

export default function App () {
  let [moistureData, setMoistureData] = useState({});
  let [lightData, setLightData] = useState({});
  let [sunlightData, setSunlightData] = useState({});
  let [granularity, setGranularity] = useState('3600');

  // granularity selection CHART_OPTIONS
  const granularitySelectionOptions = [{ value: '60', label: 'Minute' }, { value: '1', label: 'Second' }, { value: '3600', label: 'Hour' } ];

  // Get Data
  const getData = async () => {
    const res = await fetch(`http://localhost:3000/data.json?granularity=${granularity}`);
    const json = await res.json() || {};

    setMoistureData(json.moisture);
    setLightData(json.light);
    setSunlightData(json.sunlight);
  };

  // Fetch and construct plant monitor data to be graphed
  const getPlantMonitorData = async () => {
    // fetch new data
    await getData();
  };

  // Poll plant data at set intervals
  useInterval(async () => {
    await getPlantMonitorData();
  }, POLL_INTERVAL);

  // selection handler in chart
  const onTimeChangeHandler = async e => {
    const newGranularity = e ? e.value : '3600';
    setGranularity(newGranularity);
  };

  // Run when granularity is changed via select handler
  useEffect(async () => {
    await getPlantMonitorData();
  }, [granularity]);

  return (
    <Container fluid>
      <h1 align="center">Plant Monitoring Dashboard</h1>
      <h3>Select Granularity</h3>
      <Select
        options={granularitySelectionOptions}
        defaultValue={{ value: '3600', label: 'Hour' }}
        onChange={onTimeChangeHandler}
      />
      <MoistureLightChart moistureData={moistureData} lightData={lightData}/>
      <SunlightChart sunlightData={sunlightData} />
    </Container>
  );
}
