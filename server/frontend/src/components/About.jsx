import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import { StyledContainer, StyledJumbotron } from '../styles/about.styles';

export default function About() {
  return (
    <StyledContainer>
      <Row>
        <Col>
          <StyledJumbotron>
            <Container>
              <h1>Plant Monitoring App</h1>
              <p>
                Hello! Welcome to our Plant Monitoring App!
              </p>
            </Container>
          </StyledJumbotron>
        </Col>
      </Row>
    </StyledContainer>
  );
};