import Button from '@material-ui/core/Button';
import React from 'react';
import routes from '../../constants/routes';
import customLink from '../navigation/customLink';

const PasswordForgetLink = () => (
  <Button component={customLink(routes.PASSWORD_FORGET)}>
    Olvidé mi password
  </Button>
);

export default PasswordForgetLink;
