import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Switch from '@material-ui/core/Switch';
import PropTypes from 'prop-types';
import React from 'react';
import constants from "../../context/constants";
import Content from "../_common/Content";
import CustomSelect from "../_common/CustomSelect";
import MeteorRating from "../_common/meteorRating/MeteorRating";

const PersonForm = (props) => {
  const {match} = props;
  const {personId} = match.params;
  const personTitle = personId === ':personId' ? 'Nueva persona' : `Persona ${personId}`;
  const carTitle = personId === ':personId' ? 'Nuevo auto' : `Auto de ${personId}`;

  const [values, setValues] = React.useState({
    showPassword: false,
    id: '',
    name: '',
    email: '',
    password: '',
    admin: false,
    active: true,
    parkingMeteors: 1,
    car: {
      brand: '',
      model: '',
      plate: '',
      size: constants.carSizes.medium
    }
  });

  const handleClickShowPassword = () => {
    setValues({...values, showPassword: !values.showPassword});
  };

  const handleChange = name => event => {
    setValues({...values, [name]: event.target.value});
  };

  const handleSwitchChange = name => event => {
    setValues({...values, [name]: event.target.checked});
  };

  const handleCarChange = name => event => {
    const newCar = {...values.car, [name]: event.target.value};
    setValues({...values, car: newCar});
  };

  const tfStyle = {};

  const onRatingClicked = (val) => {
    setValues({...values, parkingMeteors: val});
  };

  const onCarSizeChanged = (val) => {
    const newCar = {...values.car, size: val};
    setValues({...values, car: newCar});
  };

  return (
    <Content>
      <form
        style={{
          display: 'grid',
          gridTemplateColumns: '250px 250px',
          gridColumnGap: 72
        }}
      >
        <div style={{display: 'flex', flexWrap: 'wrap', flexDirection: 'column'}}>
          <Typography variant="h5">
            <FontAwesomeIcon icon={['far', 'user-astronaut']} style={{marginRight: 16}} />
            {personTitle}
          </Typography>

          <TextField
            id="id"
            label="Cédula"
            value={values.id}
            onChange={handleChange('id')}
            margin="normal"
            style={tfStyle}
          />
          <TextField
            id="name"
            label="Nombre"
            value={values.name}
            onChange={handleChange('name')}
            margin="normal"
            style={tfStyle}
          />
          <TextField
            id="email"
            label="E-mail"
            value={values.email}
            onChange={handleChange('email')}
            margin="normal"
            style={tfStyle}
          />

          <FormControl style={{...tfStyle, marginTop: 16}}>
            <InputLabel htmlFor="adornment-password">Password</InputLabel>
            <Input
              id="adornment-password"
              type={values.showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleChange('password')}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton aria-label="Toggle password visibility" onClick={handleClickShowPassword}>
                    {values.showPassword
                      ? <FontAwesomeIcon icon={['far', 'eye']} />
                      : <FontAwesomeIcon icon={['far', 'eye-slash']} />
                    }
                  </IconButton>
                </InputAdornment>
              }
            />

          </FormControl>
          <div style={{marginTop: 16}}>
            <FormControlLabel
              value="top"
              control={<Switch
                checked={values.admin}
                onChange={handleSwitchChange('admin')}
                value="admin"
                color="primary"
              />}
              label="Admin"
              labelPlacement="top"
            />
            <FormControlLabel
              value="top"
              control={<Switch
                checked={values.active}
                onChange={handleSwitchChange('active')}
                value="active"
                color="primary"
              />}
              label="Activo"
              labelPlacement="top"
            />
          </div>

          <FormControlLabel
            value="top"
            control={<MeteorRating value={values.parkingMeteors} onClick={onRatingClicked} />}
            label="Parking stars"
            labelPlacement="top"
            style={{marginTop: 8, textAlign: 'left'}}
          />

        </div>

        <div style={{display: 'flex', flexWrap: 'wrap', flexDirection: 'column'}}>
          <Typography variant="h5">
            <FontAwesomeIcon icon={['far', 'space-shuttle']} style={{marginRight: 16}} />
            {carTitle}
          </Typography>

          <TextField
            id="brand"
            label="Marca"
            value={values.car.brand}
            onChange={handleCarChange('brand')}
            margin="normal"
            style={tfStyle}
          />
          <TextField
            id="model"
            label="Modelo"
            value={values.car.model}
            onChange={handleCarChange('model')}
            margin="normal"
            style={tfStyle}
          />
          <TextField
            id="plate"
            label="Placa"
            value={values.car.plate}
            onChange={handleCarChange('plate')}
            margin="normal"
            style={tfStyle}
          />
          <CustomSelect
            id="carSize"
            value={values.car.size}
            label="Tamaño"
            values={constants.carSizes}
            onChange={onCarSizeChanged}
          />
        </div>
      </form>
    </Content>
  )
};

PersonForm.propTypes = {
  match: PropTypes.object.isRequired,
};

PersonForm.defaultProps = {};

export default PersonForm;
