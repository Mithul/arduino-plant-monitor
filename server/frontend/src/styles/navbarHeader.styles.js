import styled from 'styled-components'
import {
  Link,
} from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';

const StyledNavbar = styled(Navbar)`
  height: 100px;
  background-image: url('Tropical-Banana-Leaves-Background.svg');
  background-position: center;
  
  a {
    color: #fff;
    font-weight: 700;
  }
`;

const StyledLink = styled(Link)`  
  padding: 10px;
  transition: all .4s ease-in-out;
  
  &:link, &:hover, &:active, &:visited, &:focus {
    text-decoration: none;
  }
  
  &:hover {
    padding: 10px;
    background-color: rgb(74, 127, 102, .5);
  }
`;
export {
  StyledNavbar,
  StyledLink,
};