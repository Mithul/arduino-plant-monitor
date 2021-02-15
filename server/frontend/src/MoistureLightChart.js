import Select from 'react-select'
import { Line } from 'react-chartjs-2';
import MomentJS from 'moment';
import React, { useState, useEffect } from 'react';

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

export default function MoistureLightChart(props){
  let moistureData = props.moistureData;
  let lightData = props.lightData;
  let [data, setData] = useState({labels: [], datasets: []})
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

  const transformDataForPlotting = () => {
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
  }

  useEffect(async () => {
    transformDataForPlotting()
  }, [props.lightData, props.moistureData])

  return (
    <Line data={data} options={CHART_OPTIONS}/>
  )
}
