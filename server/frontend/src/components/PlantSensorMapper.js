import React from "react";
import {Form, Button}  from 'react-bootstrap';
import useCustomForm from "../hooks/useCustomForm";

const initialValues = {
 plant_id: "",
 sensor_index: "",
 plant_name: ""
};

export default function PlantSensorMapper() {
 const {
   values,
   errors,
   touched,
   handleChange,
   handleBlur,
   handleSubmit
 } = useCustomForm({
   initialValues,
   onSubmit: (values) => {
     console.log(values)
     fetch("/plantSensor.json", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values.values),
      })
   }
 });
 errors.plant_name = "ERROR"
 console.log(touched, errors)
 return (
   <Form onSubmit={handleSubmit} className="App">
     <h1>Map Sensor to Plant</h1>
     <Form.Group controlId="formPlantId">
       <Form.Label>Plant ID</Form.Label>
       <Form.Control type="text" disabled placeholder="Plant ID" name="plant_id" onChange={handleChange} value={values.plant_id}/>
       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
     </Form.Group>

     <Form.Group controlId="formSensorIndex">
       <Form.Label>Sensor Index</Form.Label>
       <Form.Control type="text" placeholder="Sensor Index" name="sensor_index" onChange={handleChange} value={values.sensor_index}
       isValid={touched.sensor_index && !errors.sensor_index} isInvalid={touched.sensor_index && errors.sensor_index} onBlur={handleBlur}/>
       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
       <Form.Control.Feedback type="invalid"> {errors.sensor_index} </Form.Control.Feedback>
     </Form.Group>

     <Form.Group controlId="formPlantName">
       <Form.Label>Plant Name</Form.Label>
       <Form.Control type="text" placeholder="Plant Name" name="plant_name" onChange={handleChange} value={values.plant_name}
       isValid={touched.plant_name && !errors.plant_name} isInvalid={touched.plant_name && errors.plant_name} onBlur={handleBlur}/>
       <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
       <Form.Control.Feedback type="invalid"> {errors.plant_name} </Form.Control.Feedback>
     </Form.Group>

     <Button variant="primary" type="submit">
      Submit
    </Button>
   </Form>
 );
};
