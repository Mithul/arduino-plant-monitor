import React from "react";
import {Form, Button}  from 'react-bootstrap';
import useCustomForm from "../hooks/useCustomForm";

const initialValues = {
 plant_name: ""
};

export default function NewPlantForm() {
 const {
   values,
   errors,
   touched,
   handleChange,
   handleBlur,
   handleSubmit
 } = useCustomForm({
   initialValues,
   onSubmit: async (values) => {
     console.log(values)
     let res = await fetch("/plant/new.json", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values.values),
      })
      let json = await res.json() || {success: false, error: "Submit error"};
      if(!json.success) errors.plant_name = JSON.stringify(json.error)
   }
 });


 return (
   <Form onSubmit={handleSubmit} className="App">
     <h1>New Plant</h1>

     <Form.Group controlId="formPlantName">
       <Form.Label>Plant Name</Form.Label>
       <Form.Control type="text" placeholder="Plant Name" name="plant_name" onChange={handleChange} value={values.plant_name}
       isValid={touched.plant_name && !errors.plant_name} isInvalid={touched.plant_name && errors.plant_name} onBlur={handleBlur}/>
       <Form.Control.Feedback>Looks good! Submit to confirm</Form.Control.Feedback>
       <Form.Control.Feedback type="invalid"> {errors.plant_name} </Form.Control.Feedback>
     </Form.Group>
     <Button variant="primary" type="submit">
      Submit
    </Button>
   </Form>
 );
};
