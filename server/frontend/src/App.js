/* App.js */

import logo from './logo.svg';
import './App.css';
import SunlightChart from './SunlightChart';
import MoistureLightChart from './MoistureLightChart';
import PlantSensorMapper from './PlantSensorMapper';
import Select from 'react-select'
import {Line} from 'react-chartjs-2';

var React = require('react');
var Component = React.Component;
var CanvasJSReact = require('canvasjs-react-charts');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var MomentJS = require('moment');


class App extends Component {
  constructor(props) {
    super(props);
    this.poller = null;
    this.state = {
      moisture_data : {},
      light_data: {},
      granularity: '3600',
      sunlight_duration: {}
    };
  }

  getData = () => {
    fetch("http://10.0.0.236:3000/data.json?granularity="+this.state.granularity)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            moisture_data: result.moisture,
            light_data: result.light,
            sunlight_duration: result.sunlight_duration
          });
        },
        (error) => {
          this.setState({
            moisture_data : {},
            light_data: {},
            sunlight_duration: {}
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
    this.setState({granularity: e ? e.value : '1'}, this.getData);
  }

  render() {
    console.log(this.state)
    const timeOptions = [{value: "60", label: "Minute"}, {value: "1", label: "Second"}, {value: "3600", label: "Hour"}]
		return (
	    <div>
        <Select options={timeOptions} defaultValue="s" onChange={this.timeChange}/>
        <PlantSensorMapper />
        <MoistureLightChart moisture_data={this.state.moisture_data} light_data={this.state.light_data}/>
        <SunlightChart data={this.state.sunlight_duration} />
  		</div>
		);
  }
}

export default App;
