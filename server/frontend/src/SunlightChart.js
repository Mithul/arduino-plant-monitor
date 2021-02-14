import {Bar} from 'react-chartjs-2';
var React = require('react');
var Component = React.Component;
var MomentJS = require('moment');

class SunlightChart extends Component {
  render = () => {
    var sunlight_data = {labels: [], datasets: []}
    var sunlight_duration = this.props.data;
    var durationDataPoints = []
    var averageLightDataPoints = []
    for(var day in sunlight_duration){
      sunlight_data.labels.push(MomentJS(day*1000).format('ddd, MMM D'))
      durationDataPoints.push(sunlight_duration[day]['duration'])
      averageLightDataPoints.push(sunlight_duration[day]['average_light'])
    }
    sunlight_data['datasets'].push({data: durationDataPoints, label: 'Sunlight hours', 'backgroundColor': '#ffca28', yAxisID: 'duration'})
    sunlight_data['datasets'].push({data: averageLightDataPoints, label: 'Average Light Intensity', 'backgroundColor': '#7f7a20', yAxisID: 'intensity'})
    var sunlight_options = {
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

    return (
      <Bar data={sunlight_data} options={sunlight_options} />
    )
  }
}

export default SunlightChart;
