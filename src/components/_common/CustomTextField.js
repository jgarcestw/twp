/* eslint-disable react/jsx-props-no-spreading */
import TextField from '@material-ui/core/TextField';
import React from 'react';
import PropTypes from 'prop-types';

const CustomTextField = (props) => {
  const { margin, id, ...other } = props;
  const style = margin ? { marginTop: 16 } : {};
  return (
    <TextField
      {...other}
      name={id}
      variant="outlined"
      style={style}
    />
  );
};

CustomTextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  margin: PropTypes.bool,
};

CustomTextField.defaultProps = {
  margin: true,
};

export default CustomTextField;
