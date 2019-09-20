import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  AppBar, Hidden, IconButton, Toolbar, Tooltip,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import roles from '../../constants/roles';
import routes from '../../constants/routes';
import shapes from '../../constants/shapes';
import AuthUserContext from '../session/context';
import SignOutButton from '../signOut/SignOutButton';
import AdminMenu from './AdminMenu';
import NavBarHybridButton from './NavBarHybridButton';
import NavBarIconButton from './NavBarIconButton';
import NavBarTextLink from './NavBarTextLink';

const Navigation = () => (
  <div>
    <AuthUserContext.Consumer>
      {(authUser) => (authUser
        ? <NavigationAuth authUser={authUser} />
        : null)}
    </AuthUserContext.Consumer>
  </div>
);

const myPaymentsButton = (isAdmin) => (isAdmin
  ? <NavBarIconButton title="Mis pagos" icon="hand-holding-usd" to={routes.USER_PAYMENT} color="#CD3564" />
  : <NavBarHybridButton title="Mis pagos" icon="hand-holding-usd" to={routes.USER_PAYMENT} color="secondary" />);

const NavigationAuth = ({ authUser }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const { roles: userRoles } = authUser;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const adminNav = userRoles[roles.ADMIN] ? (
    <>
      <Hidden smDown>
        <NavBarIconButton title="Personas" icon="user-astronaut" to={routes.USERS} />
        <NavBarIconButton title="Puestos" icon="warehouse" to={routes.BUILDINGS} />
      </Hidden>
      <NavBarIconButton title="Asignaciones" icon="rocket" to={routes.ASSIGNMENTS} />
      <Hidden smDown>
        <NavBarIconButton title="Email" icon="envelope-open-dollar" to={routes.ASSIGNMENT_EMAIL} />
      </Hidden>
      <NavBarIconButton title="Pagos" icon="money-check-edit-alt" to={routes.PAYMENTS} />
      <NavBarIconButton title="Pagos Usuarios" icon="sack-dollar" to={routes.ALL_USERS_PAYMENTS} />
      <Hidden smDown>
        <NavBarIconButton title="Params" icon="alicorn" to={routes.PARAMS} />
      </Hidden>
    </>
  ) : null;

  const adminMenu = userRoles[roles.ADMIN] ? (
    <Hidden mdUp>
      <Tooltip title="Admin menu">
        <IconButton
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <FontAwesomeIcon icon={['far', 'alicorn']} />
        </IconButton>
      </Tooltip>
      <AdminMenu anchorEl={anchorEl} handleClose={handleClose} open={open} />
    </Hidden>
  ) : null;

  return (
    <AppBar position="static" className="root">
      <Toolbar style={{ justifyContent: 'space-between' }}>
        <div className="navbar-part">
          <NavBarTextLink to={routes.HOME} text="TWP" title="Inicio" />
          {myPaymentsButton(userRoles[roles.ADMIN])}
          {adminNav}
        </div>

        <div className="navbar-part">
          {adminMenu}
          <NavBarIconButton title="Mi cuenta" icon="user" to={routes.ACCOUNT} />
          <SignOutButton />
        </div>
      </Toolbar>
    </AppBar>
  );
};

NavigationAuth.propTypes = {
  authUser: PropTypes.shape(shapes.user).isRequired,
};

export default Navigation;
