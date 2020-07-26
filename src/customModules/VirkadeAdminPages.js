import React from 'react';
import { BrowserRouter, Route, Link, Switch } from "react-router-dom"
import Home from './pages/Home.js'

const VirkadeAdminPages = () => {
  return (
    <BrowserRouter>
      <Route path="/" component={Home} />
    </BrowserRouter>
  )
}

export default VirkadeAdminPages;
