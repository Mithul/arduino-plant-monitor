/* App.js */

import logo from './logo.svg';
import './App.css';
import Select from 'react-select'
import {Line} from 'react-chartjs-2';

var React = require('react');
var Component = React.Component;
var CanvasJSReact = require('canvasjs-react-charts');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var MomentJS = require('moment');

const default_dataset_opts = {type: 'line', fill: false, lineTension: 0.5, pointRadius:0,}

class App extends Component {
  constructor(props) {
    super(props);
    this.poller = null;
    this.state = {
      moisture_data : {},
      light_data: {},
      granularity: '60'
    };
    this.colors = ['#004d40', '#39796b', '#2e7d32', '#60ad5e', '#005005', '#827717', '#b4a647', '#524c00']
  }

  getData = () => {
    fetch("http://10.0.0.236:3000/data.json?granularity="+this.state.granularity)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            moisture_data: result.moisture,
            light_data: result.light,
          });
        },
        (error) => {
          this.setState({
            moisture_data : {},
            light_data: {},
          });
        }
      )
  }
  componentDidMount() {
    this.getData();
    this.poller = setInterval(this.getData, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.poller);
  }

  timeChange = e => {
    console.log("Change", e)
    this.setState({granularity: e ? e.value : '1'}, this.getData);

  }

  render() {
    console.log(this.state)
      var data = {'labels': [], 'datasets': []}
      var options = {
        scales: {
            xAxes: {
                type: 'time',
                distribution: 'series'
            }
        }
    }
      var moisture_data = this.state.moisture_data;
      var light_data = this.state.light_data;
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


      const timeOptions = [{value: "60", label: "Minute"}, {value: "1", label: "Second"}, {value: "3600", label: "Hour"}]
      console.log(data)
  		return (
  	    <div>
          <Select options={timeOptions} defaultValue="s" onChange={this.timeChange}/>
          <Line data={data}/>
    		</div>
  		);
  }
}

export default App;
