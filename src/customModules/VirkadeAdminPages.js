import React from 'react';
import { BrowserRouter, Route, Link, Switch, Redirect } from "react-router-dom"
import Home from './pages/Home.js'
import Search from './pages/Search.js';
import User from './pages/User.js';
import PlaySession from './pages/PlaySession.js';
import Location from './pages/Location.js';
import Activity from './pages/Activity.js';

export const ROUTES = {
  BASE_PAGE: '/',
  HOME_PAGE: '/home',
  SEARCH_PAGE: '/search',
  USER_PAGE: '/user',
  SESSION_PAGE: '/play-session',
  LOCATION_PAGE: '/location',
  ACTIVITY_PAGE: '/activity',
}

const VirkadeAdminPages = () => {
  return (
    <BrowserRouter>
      <Route exact path={ROUTES.BASE_PAGE}><Redirect to={ROUTES.HOME_PAGE} /></Route>
      <Route exact path={ROUTES.HOME_PAGE} component={Home} />
      <Route exact path={ROUTES.SEARCH_PAGE} component={Search} />
      <Route exact path={ROUTES.USER_PAGE} component={User} />
      <Route exact path={ROUTES.SESSION_PAGE} component={PlaySession} />
      <Route exact path={ROUTES.LOCATION_PAGE} component={Location} />
      <Route exact path={ROUTES.ACTIVITY_PAGE} component={Activity} />
    </BrowserRouter>
  )
}

export default VirkadeAdminPages;
