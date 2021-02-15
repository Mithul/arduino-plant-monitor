import { Bar } from 'react-chartjs-2';
import MomentJS from 'moment';
import React, { useState, useEffect } from 'react';

const CHART_OPTIONS = {
  tooltips: {
      mode: 'index',
      intersect: true
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
          drawOnChartArea: false
        }
      }],
    }
}

export default function SunlightChart(props) {
  let [data, setData] = useState({labels: [], datasets: []});
  let sunlighData = props.sunlightData;

  const createSunlightObject = () => {
    let _data = {labels: [], datasets: []}
    var durationDataPoints = []
    var averageLightDataPoints = []
    for(var day in sunlighData){
      _data.labels.push(MomentJS(day*1000).format('ddd, MMM D'))
      durationDataPoints.push(sunlighData[day]['duration'])
      averageLightDataPoints.push(sunlighData[day]['average_light'])
    }
    _data.datasets.push({data: durationDataPoints, label: 'Sunlight hours', 'backgroundColor': '#ffca28', yAxisID: 'duration'})
    _data.datasets.push({data: averageLightDataPoints, label: 'Average Light Intensity', 'backgroundColor': '#7f7a20', yAxisID: 'intensity'})
    return _data
  }

  useEffect(() => {
    let _data = createSunlightObject()
    setData(_data)
  }, [props.sunlightData])

  return (
    <Bar data={data} options={CHART_OPTIONS} />
  )
}
