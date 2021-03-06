/* App.js */

import React, { useState } from 'react';
import Select from 'react-select'
import MoistureLightChart from './components/MoistureLightChart';
import SunlightChart from './components/SunlightChart';
import Container  from 'react-bootstrap/Container';
import Row  from 'react-bootstrap/Row';
import Col  from 'react-bootstrap/Col';
import Form  from 'react-bootstrap/Form';

export default function App () {
  let [granularity, setGranularity] = useState('3600');

  // granularity selection CHART_OPTIONS
  const granularitySelectionOptions = [{ value: '60', label: 'Minute' }, { value: '1', label: 'Second' }, { value: '3600', label: 'Hour' } ];

  // selection handler in chart
  const onTimeChangeHandler = async e => {
    const newGranularity = e ? e.value : '3600';
    setGranularity(newGranularity);
  };

  return (
    <Container>
      <Row>
        <h1 align="center">Plant Monitoring Dashboard</h1>
      </Row>
      <Row>
        <Form>
          <Form.Label>Select Granularity</Form.Label>
          <Select
            options={granularitySelectionOptions}
            defaultValue={{ value: '3600', label: 'Hour' }}
            onChange={onTimeChangeHandler}
          />
        </Form>
      </Row>
      <Row>
        <Col>
          <MoistureLightChart granularity={granularity}/>
        </Col>
        <Col>
          <SunlightChart granularity={granularity} />
        </Col>
      </Row>
    </Container>
  );
};
