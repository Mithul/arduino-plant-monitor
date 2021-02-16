import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { StyledNavbar, StyledLink } from '../styles/navbarHeader.styles';

export default function NavbarHeader() {
  return (
      <StyledNavbar variant="light" sticky="top">
        <Navbar.Brand><StyledLink to="/">Plant Monitor</StyledLink></Navbar.Brand>
        <Nav className="mr-auto">
          <StyledLink to="/add-plant">Add plant</StyledLink>
          <StyledLink to="/look-up">Look up</StyledLink>
        </Nav>
        <Nav>
          <StyledLink to="/about">About</StyledLink>
        </Nav>
      </StyledNavbar>
  );
}