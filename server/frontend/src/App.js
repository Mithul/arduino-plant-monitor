/* App.js */

import React, { useState, useEffect } from 'react';
import Select from 'react-select'
import { Line } from 'react-chartjs-2';
import MomentJS from 'moment';
import './styles/App.css';
import {
  PLANT_COLORS,
  LIGHT,
} from './constants/colors';

const DEFAULT_DATASET_OPTS = {
  type: 'line',
  fill: false,
  lineTension: 0.5,
  pointRadius: 0,
  hitRadius: 3,
};

// chart options
const CHART_OPTIONS = {
  scales: {
    xAxes: {
      type: 'time',
      distribution: 'series'
    }
  }, tooltips: {
    mode: 'x'
  },
  responsive: true,
};

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
  let moistureData = {};
  let lightData = {};
  let [granularity, setGranularity] = useState('3600');
  let [data, setData] = useState({ 'labels': [], 'datasets': [] });

  // granularity selection CHART_OPTIONS
  const granularitySelectionOptions = [{ value: '60', label: 'Minute' }, { value: '1', label: 'Second' }, { value: '3600', label: 'Hour' } ];

  // Get Data
  const getData = async () => {
    const res = await fetch(`http://localhost:3000/data.json?granularity=${granularity}`);
    const json = await res.json() || {};
    moistureData = json.moisture;
    lightData = json.light;
  };

  const fillLabelsFromData = (_data) => {
    let labels = [];
    const timestamps = Object.keys(_data).sort();
    timestamps.forEach((timestamp) => {
      labels.push(MomentJS(timestamp * 1000).format('ddd, MMM D hh:mm:ss'));
    });

    return labels;
  };

  const createMoistureObject = () => {
    let dataPoints = [];
    let localData = {'labels': [], 'datasets': []};
    const moistureEntries = Object.entries(moistureData);

    // Fill datasets
    moistureEntries.forEach((moistureEntry) => {
      const moistureIndex = moistureEntry[0];
      const moistureObject = moistureEntry[1];
      let plantData = moistureObject;
      let timestamps = Object.keys(plantData).sort();
      dataPoints = [];

      timestamps.forEach((timestamp) => {
        let moistureValue = plantData[timestamp];
        dataPoints.push(moistureValue);
      });

      localData['datasets'].push({...DEFAULT_DATASET_OPTS, label: moistureIndex, 'data': dataPoints, 'borderColor': PLANT_COLORS[moistureIndex]});
    });

    return localData;
  };

  const createLightObject = () => {
    let dataPoints = [];
    let localData = {'datasets': []};

    Object.keys(lightData).sort().forEach((timestamp) => {
      let lightValue = lightData[timestamp];
      dataPoints.push(lightValue);
    });

    localData['datasets'].push({...DEFAULT_DATASET_OPTS, label: 'light', data: dataPoints, 'borderColor': LIGHT });

    return localData;
  };

  // Fetch and construct plant monitor data to be graphed
  const getPlantMonitorData = async () => {
    // fetch new data
    await getData();
    let labels = fillLabelsFromData(lightData);

    // construct new data points in chart
    let dataMoisture = createMoistureObject();
    let dataLight = createLightObject();
    const dataSets = [
      ...dataMoisture.datasets,
      ...dataLight.datasets,
    ];

    setData({
      datasets: dataSets,
      labels: labels,
    });
  };

  // Poll plant data at set intervals
  useInterval(async () => {
    console.log('Polling plant monitor data...');

    await getPlantMonitorData();
  }, 10000);

  // selection handler in chart
  const onTimeChangeHandler = async e => {
    const newGranularity = e ? e.value : '1';
    setGranularity(newGranularity);
  };

  // Run when granularity is changed via select handler
  useEffect(async () => {
    await getPlantMonitorData();
  }, [granularity]);

  return (
    <div>
      <Select options={granularitySelectionOptions} defaultValue="s" onChange={onTimeChangeHandler} />
      <Line data={data} options={CHART_OPTIONS}/>
    </div>
  );
}
