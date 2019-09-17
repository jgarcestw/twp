/* eslint-disable react/no-array-index-key */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { compose } from 'recompose';
import conditions from '../../constants/conditions';
import Assignments from '../../domain/Assignments';
import Content from '../_common/Content';
import CustomError from '../_common/CustomError';
import CustomLoader from '../_common/CustomLoader';
import AssignmentsForEmailList from '../assignments/AssignmentsForEmailList';
import withFirebase from '../firebase/withFirebase';
import withAuthorization from '../session/withAuthorization';
import EmailContent from './EmailContent';

const getCurrentMonth = (date) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo',
    'Abril', 'Mayo', 'Junio', 'Julio',
    'Agosto', 'Septiembre', 'Octubre',
    'Noviembre', 'Diciembre',
  ];
  const monthIndex = date.getMonth();
  return monthNames[monthIndex];
};

const getDateToSave = (date) => ({
  month: date.getMonth(),
  year: date.getFullYear(),
});

const getPaymentsId = (date) => {
  const dateToSave = getDateToSave(date);
  return `payment_${dateToSave.month}_${dateToSave.year}`;
};

const EmailPage = ({ firebase }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSaved, setSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingParams, setLoadingParams] = useState(false);
  const [loadingUserPayments, setLoadingUserPayments] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [params, setParams] = useState({});
  const [date] = useState(new Date());

  useEffect(() => {
    setLoadingBuildings(true);
    setLoadingUsers(true);
    setLoadingParams(true);
    setLoadingUserPayments(true);
    firebase.userPayment(getPaymentsId(date)).on('value', (snapshotUserPayments) => {
      const savedValues = snapshotUserPayments.val();
      setLoadingUserPayments(false);

      if (savedValues) {
        setLoadingBuildings(false);
        setLoadingUsers(false);
        setLoadingParams(false);
        setLoadingUserPayments(false);
        setSaved(true);
        setParams(savedValues.params);
        setAssignments(savedValues.assignments);
      } else {
        firebase.users().on('value', (snapshotUsers) => {
          const usersObject = snapshotUsers.val();
          setLoadingUsers(false);
          let asg;
          firebase.buildings().on('value', (snapshotBuildings) => {
            const buildingsObject = snapshotBuildings.val();
            const usersList = Object.values(usersObject).filter((u) => u.isActive);
            asg = new Assignments(usersList, buildingsObject);
            setLoadingBuildings(false);

            firebase.params().on('value', (snapshotParams) => {
              const paramsObject = snapshotParams.val();
              setParams(paramsObject);
              const a = asg.getListForEmail(paramsObject);
              setAssignments(a);
              setLoadingParams(false);
            });
          });
        });
      }
    });

    return function cleanup() {
      firebase.buildings().off();
      firebase.params().off();
      firebase.users().off();
    };
  }, [firebase, date]);

  const onSave = (event) => {
    setLoadingSave(true);
    const dateToSave = getDateToSave(date);
    const payments = {
      params,
      assignments,
      payments: {},
      date: dateToSave,
    };

    firebase
      .userPayment(getPaymentsId(date))
      .set(payments)
      .then(() => {
        setLoadingSave(false);
      })
      .catch((error) => {
        setErrorMessage(error);
        setLoadingSave(false);
      });
    event.preventDefault();
  };

  const isLoading = loadingBuildings || loadingUsers || loadingParams || loadingUserPayments;
  const icon = loadingSave ? 'spinner' : 'save';
  return (
    <Content>
      {isSaved ? (
        <Typography style={{ marginBottom: 32 }} color="textSecondary">
          {`Ya está guardado para ${getCurrentMonth(date)}`}
        </Typography>
      ) : (
        <Button style={{ marginBottom: 32 }} onClick={(event) => onSave(event)}>
          <FontAwesomeIcon icon={['far', icon]} style={{ marginRight: 8 }} />
          Guardar para registrar pagos
        </Button>
      )}
      <CustomError error={errorMessage} />

      <CustomLoader isLoading={isLoading} />
      <EmailContent
        params={params}
        valuePerPerson={assignments.valuePerPerson}
        month={getCurrentMonth(date)}
      />
      <AssignmentsForEmailList assignments={assignments.people} />
    </Content>
  );
};

EmailPage.propTypes = {
  firebase: PropTypes.any.isRequired,
};

export default compose(
  withAuthorization(conditions.isAdminUser),
  withFirebase,
)(EmailPage);
