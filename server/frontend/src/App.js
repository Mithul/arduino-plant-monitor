/* App.js */

import logo from './logo.svg';
import './App.css';
import Select from 'react-select'

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
      granularity: 'm'
    };
  }

  getData = () => {
    fetch("http://10.0.0.236:3000/data.json")
      .then(res => res.json())
      .then(
        (result) => {
          // console.log(result)
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
    this.setState({granularity: e ? e.value : 's'})
  }

  render() {
    console.log(this.state)
      var data = []
      var moisture_data = this.state.moisture_data;
      var light_data = this.state.light_data;
      for(var plant_id in moisture_data){
        if(moisture_data.hasOwnProperty(plant_id)){
          var plant_data = moisture_data[plant_id];
          // console.log(plant_id, plant_data)
          var dataPoints = []
          var timestamps = Object.keys(plant_data).sort()
          timestamps.forEach((timestamp, i) => {
            if(this.state.granularity === 'm' && i%60 !== 0){
              return;
            }else if (this.state.granularity === 'h' && i%3600 !== 0) {
              return;
            }
            if(plant_data.hasOwnProperty(timestamp)){
              var moisture = plant_data[timestamp]
              dataPoints.push({y: moisture, label: MomentJS(timestamp*1000).format('ddd, MMM d hh:mm:ss')})
            }
          });
          data.push({type: "spline", name: plant_id, showInLegend: true, dataPoints: dataPoints, connectNullData: true})
        }
      }
      var dataPoints = []
      Object.keys(light_data).sort().forEach((timestamp, i) => {
        if(this.state.granularity === 'm' && i%60 !== 0){
          return;
        }else if (this.state.granularity === 'h' && i%3600 !== 0) {
          return;
        }
        if(light_data.hasOwnProperty(timestamp)){
            var light = light_data[timestamp]
            dataPoints.push({y: light, label: MomentJS(timestamp*1000).format('ddd, MMM d hh:mm:ss')})
        }
      });
      data.push({type: "spline", name: 'light', showInLegend: true, dataPoints: dataPoints, connectNullData: true})

  		const options = {
        animationEnabled: true,
        zoomEnabled: true,
  				title:{
  					text: "Plant Moisture Data"
  				},
  				axisY : {
  					title: "Moisture"
  				},
          axisX : {
  					title: "Time"
  				},
  				toolTip: {
  					shared: true
  				},
  				data: data
  		}

      const timeOptions = [{value: "m", label: "Minute"}, {value: "s", label: "Second"}, {value: "h", label: "Hour"}]

  		return (
  	    <div>
          <Select options={timeOptions} defaultValue="s" onChange={this.timeChange}/>
    			<CanvasJSChart options = {options} />
    		</div>
  		);
  }
}

export default App;
