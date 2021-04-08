import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import Input from '../../shared/components/FormElements/Input';
import Card from '../../shared/components/UIElements/Card';
import { useForm } from '../../shared/hooks/form-hook';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from '../../shared/utils/validators';

import { useHttpClient } from '../../shared/hooks/http-hook';

import './NewPlace.css';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { AuthContext } from '../../shared/context/auth-context';

const UpdatePlace = () => {
  const history = useHistory();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const placeId = useParams().placeId;
  const auth = useContext(AuthContext);

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false,
      },
      description: {
        value: '',
        isValid: false,
      },
    },
    true
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const resData = await sendRequest(
          `http://127.0.0.1:5000/api/places/${placeId}`
        );
        setLoadedPlace(resData.place);
        setFormData(
          {
            title: {
              value: resData?.place?.title,
              isValid: true,
            },
            description: {
              value: resData?.place?.description,
              isValid: true,
            },
          },
          true
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      await sendRequest(
        `http://127.0.0.1:5000/api/places/${placeId}`,
        'PATCH',
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token,
        }
      );
      history.push('/' + auth.userId + '/places');
    } catch (error) {
      console.log(error);
    }
  };
  if (!loadedPlace && !error) {
    return (
      <div className='center'>
        <Card>
          <h2>Place not found</h2>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='center'>
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {formState?.inputs?.title.value && (
        <form className='place-form' onSubmit={placeUpdateSubmitHandler}>
          <Input
            id='title'
            element='input'
            type='text'
            label='Title'
            validators={[VALIDATOR_REQUIRE()]}
            errorText='enter a valid title'
            onInput={inputHandler}
            value={formState.inputs.title.value}
            valid={formState.inputs.title.isValid}
          />
          <Input
            id='description'
            element='textarea'
            type='text'
            label='Description'
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText='enter a valid description min characters 5'
            onInput={inputHandler}
            value={formState.inputs.description.value}
            valid={formState.inputs.description.isValid}
          />

          <Button type='submit' disabled={!formState.isValid}>
            Update Place
          </Button>
        </form>
      )}
    </>
  );
};

export default UpdatePlace;
