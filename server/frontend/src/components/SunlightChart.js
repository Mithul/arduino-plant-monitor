import { Bar } from 'react-chartjs-2';
import MomentJS from 'moment';
import React, { useState, useEffect } from 'react';
import {
  BRASS,
  LIGHT,
} from '../constants/colors';
import { getDefaultDataObject } from '../utils';

const CHART_OPTIONS = {
  tooltips: {
      mode: 'index',
      intersect: true,
    },
    scales: {
      yAxes: [{
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'left',
        id: 'duration',
      }, {
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'right',
        id: 'intensity',
        gridLines: {
          drawOnChartArea: false,
        }
      }],
    }
};

export default function SunlightChart({ sunlightData }) {
  const createSunlightObject = () => {
    let _data = getDefaultDataObject();
    let durationDataPoints = [];
    let averageLightDataPoints = [];
    const sunlightDataEntries = Object.entries(sunlightData);

    sunlightDataEntries.forEach((entry) => {
      _data.labels.push(MomentJS(entry[0] * 1000).format('ddd, MMM D'));
      durationDataPoints.push(entry[1].duration);
      averageLightDataPoints.push(entry[1].average_light);
    });

    if (durationDataPoints.length && averageLightDataPoints.length) {
      _data.datasets.push({ data: durationDataPoints, label: 'Sunlight hours', 'backgroundColor': LIGHT, yAxisID: 'duration' });
      _data.datasets.push({ data: averageLightDataPoints, label: 'Average Light Intensity', 'backgroundColor': BRASS, yAxisID: 'intensity' });
    }

    return _data;
  };

  return (
    <Bar data={createSunlightObject} options={CHART_OPTIONS} />
  )
}
