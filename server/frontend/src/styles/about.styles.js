import styled from 'styled-components'
import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';
import { CYPRUS } from '../constants/colors';

const StyledContainer = styled(Container)`
  margin-top: 20px;
`;

const StyledJumbotron = styled(Jumbotron)`
  background: #F7ADB3;
  color: ${CYPRUS};
  text-align: center;
`;

export {
  StyledContainer,
  StyledJumbotron,
};