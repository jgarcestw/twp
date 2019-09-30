/* eslint-disable react/no-array-index-key */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Grid, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { compose } from 'recompose';
import conditions from '../../constants/conditions';
import monthsHelper from '../../constants/monthsHelper';
import Assignments from '../../domain/Assignments';
import Content from '../_common/Content';
import CustomError from '../_common/CustomError';
import CustomLoader from '../_common/CustomLoader';
import AssignmentsForEmailList from '../assignments/AssignmentsForEmailList';
import withFirebase from '../firebase/withFirebase';
import withAuthorization from '../session/withAuthorization';
import AssignmentEmailContent from './AssignmentEmailContent';

const getDateToSave = (date) => ({
  month: date.getMonth(),
  year: date.getFullYear(),
});

const getDateToSaveNext = (date) => {
  let month = date.getMonth();
  let year = date.getFullYear();
  if (month === 11) {
    month = 0;
    year += 1;
  } else {
    month += 1;
  }
  return ({
    month,
    year,
  });
};

const getCurrentPaymentsId = (date) => `payment_${date.getMonth()}_${date.getFullYear()}`;
const getNextPaymentsId = (date) => {
  let month = date.getMonth();
  let year = date.getFullYear();
  if (month === 11) {
    month = 0;
    year += 1;
  } else {
    month += 1;
  }
  return `payment_${month}_${year}`;
};
const getPaymentsId = (dateToSave) => `payment_${dateToSave.month}_${dateToSave.year}`;

const AssignmentEmailPage = ({ firebase }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSaved, setSaved] = useState(false);
  const [isSavedNext, setSavedNext] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingParams, setLoadingParams] = useState(false);
  const [loadingUserPayments, setLoadingUserPayments] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [params, setParams] = useState({});
  const [date] = useState(new Date());

  useEffect(() => {
    setLoadingBuildings(true);
    setLoadingUsers(true);
    setLoadingParams(true);
    setLoadingUserPayments(true);
    firebase.userPayment(getNextPaymentsId(date)).on('value', (snapshotUserPayments) => {
      const savedValues = snapshotUserPayments.val();
      if (savedValues) {
        setSavedNext(true);
      }
    });
    firebase.userPayment(getCurrentPaymentsId(date)).on('value', (snapshotUserPayments) => {
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
              const b = asg.getListForPayments();
              setPayments(b);
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
      firebase.userPayments().off();
    };
  }, [firebase, date]);

  const saveAssignments = (dateToSave) => {
    const userPayments = {
      params,
      assignments,
      date: dateToSave,
    };
    const ownerPayments = {
      payments,
      date: dateToSave,
    };

    const paymentsId = getPaymentsId(dateToSave);
    firebase
      .userPayment(paymentsId)
      .set(userPayments)
      .then(() => {
        setLoadingSave(false);
      })
      .catch((error) => {
        setErrorMessage(error);
        setLoadingSave(false);
      });

    firebase
      .ownerPayment(paymentsId)
      .set(ownerPayments)
      .then(() => {
        setLoadingSave(false);
      })
      .catch((error) => {
        setErrorMessage(error);
        setLoadingSave(false);
      });
  };

  const onSave = (event, isNext) => {
    setLoadingSave(true);
    const dateToSave = isNext ? getDateToSaveNext(date) : getDateToSave(date);
    saveAssignments(dateToSave);
    event.preventDefault();
  };

  const isLoading = loadingBuildings || loadingUsers || loadingParams || loadingUserPayments;
  const icon = loadingSave ? 'spinner' : 'save';
  const getMonthElement = (savedFlag, isNext) => {
    const month = isNext
      ? monthsHelper.getNextMonthFromDate(date)
      : monthsHelper.getMonthFromDate(date);
    return savedFlag
      ? (
        <Typography style={{ marginBottom: 32 }} color="textSecondary">
          {`Ya está guardado para ${month}`}
        </Typography>
      )
      : (
        <Button style={{ marginBottom: 32 }} onClick={(event) => onSave(event, isNext)}>
          <FontAwesomeIcon icon={['far', icon]} style={{ marginRight: 8 }} />
          {`Guardar para registrar pagos (${month})`}
        </Button>
      );
  };
  const nextMonthElement = getMonthElement(isSavedNext, true);
  const currentMonthElement = getMonthElement(isSaved, false);

  return (
    <Content>
      <Grid item xs={12} container>
        <Grid item xs={6}>
          {currentMonthElement}
        </Grid>
        <Grid item xs={6}>
          {nextMonthElement}
        </Grid>
      </Grid>
      <Grid item sx={12}>
        <CustomError error={errorMessage} />
      </Grid>
      <Grid item sx={12}>
        <CustomLoader isLoading={isLoading} />
      </Grid>
      <Grid item sx={12}>
        <AssignmentEmailContent
          params={params}
          valuePerPerson={assignments.valuePerPerson}
          month={monthsHelper.getMonthFromDate(date)}
        />
        <AssignmentsForEmailList assignments={assignments.people} />
      </Grid>
    </Content>
  );
};

AssignmentEmailPage.propTypes = {
  firebase: PropTypes.any.isRequired,
};

export default compose(
  withAuthorization(conditions.isAdminUser),
  withFirebase,
)(AssignmentEmailPage);
