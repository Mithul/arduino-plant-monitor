import {Line} from 'react-chartjs-2';
var React = require('react');
var Component = React.Component;
var MomentJS = require('moment');

const default_dataset_opts = {type: 'line', fill: false, lineTension: 0.5, pointRadius:0, hitRadius:3}

class MoistureLightChart extends Component {
  colors = ['#004d40', '#39796b', '#2e7d32', '#60ad5e', '#005005', '#827717', '#b4a647', '#524c00']

  render = () => {
    var data = {'labels': [], 'datasets': []}
    var options = {
      scales: {
          xAxes: {
              type: 'time',
              distribution: 'series'
          }
      }, tooltips: {
        mode: 'x'
      }
  }
    var moisture_data = this.props.moisture_data;
    var light_data = this.props.light_data;
    var time_done = false;
    for(var plant_id in moisture_data){
      if(moisture_data.hasOwnProperty(plant_id)){
        var plant_data = moisture_data[plant_id];
        var dataPoints = []
        var timestamps = Object.keys(plant_data).sort()
        timestamps.forEach((timestamp, i) => {
          if(!time_done){
            data['labels'].push(MomentJS(timestamp*1000).format('ddd, MMM D hh:mm:ss'))
          }
          if(plant_data.hasOwnProperty(timestamp)){
            var moisture = plant_data[timestamp]
            dataPoints.push(moisture)
          }
        });
        time_done = true;
        data['datasets'].push({...default_dataset_opts, label: plant_id, 'data': dataPoints, 'borderColor': this.colors[plant_id]})
      }
    }
    var dataPoints = []
    Object.keys(light_data).sort().forEach((timestamp, i) => {
      if(light_data.hasOwnProperty(timestamp)){
          var light = light_data[timestamp]
          dataPoints.push(light)
      }
    });
    data['datasets'].push({...default_dataset_opts, label: 'light', data: dataPoints, 'borderColor': '#ffca28'})

    return (
      <Line data={data} options={options}/>
    )
  }
}

export default MoistureLightChart;
