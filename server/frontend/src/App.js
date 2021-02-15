/* App.js */

import React, { useState, useEffect } from 'react';
import Select from 'react-select'
import { Line } from 'react-chartjs-2';
import MomentJS from 'moment';
import MoistureLightChart from './MoistureLightChart';
import SunlightChart from './SunlightChart';
import PlantSensorMapper from './PlantSensorMapper';
import './styles/App.css';


const useInterval = (callback, delay) => {
  const savedCallback = React.useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

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
    setMoistureData(json.moisture)
    setLightData(json.light)
    setSunlightData(json.sunlight)
    return json;
  };

  // Fetch and construct plant monitor data to be graphed
  const getPlantMonitorData = async () => {
    // fetch new data
    await getData();
  };

  // Poll plant data at set intervals
  useInterval(async () => {
    await getPlantMonitorData();
  }, 10000);

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
    <div>
      <Select options={granularitySelectionOptions} defaultValue="s" onChange={onTimeChangeHandler} />
      <MoistureLightChart moistureData={moistureData} lightData={lightData}/>
      <SunlightChart sunlightData={sunlightData} />
      {/*<Line data={data} options={CHART_OPTIONS}/>*/}
    </div>
  );
}
