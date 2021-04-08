import React, { useState, useContext } from 'react';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import './PlaceItem.css';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const PlaceItem = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);
  const showDeleteHandler = () => {
    setShowConfirm(true);
  };
  const closeDeleteConfirmHandler = () => {
    setShowConfirm(false);
  };
  const confirmDeleteHandler = async () => {
    setShowConfirm(false);
    try {
      await sendRequest(
        `http://127.0.0.1:5000/api/places/${props.id}`,
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token,
        }
      );
      props.onDelete(props.id);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancle={closeMapHandler}
        header={props.address}
        contentClasee='place-item__modal-content'
        footerClass='place-item__modal-actions'
        footer={<Button onClick={closeMapHandler}>Close</Button>}
      >
        <div className='map-container'>
          <h2>Map Loading...</h2>
        </div>
      </Modal>
      <Modal
        show={showConfirm}
        onCancle={closeDeleteConfirmHandler}
        header='Are you sure?'
        footerClass='place-item__modal-actions'
        footer={
          <>
            <Button inverse onClick={closeDeleteConfirmHandler}>
              Cancle
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              Delete
            </Button>
          </>
        }
      >
        <p>Do you want to delete it?</p>
      </Modal>
      <li className='place-item'>
        <Card className='place-item__content'>
          {isLoading && <LoadingSpinner overlayMode />}
          <div className='place-item__image'>
            <img
              src={`http://127.0.0.1:5000/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className='place-item__info'>
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className='place-item__actions'>
            <Button inverse onClick={openMapHandler}>
              View On Map
            </Button>

            {auth.isLoggedIn && (
              <Button to={`/places/${props.id}`}>Edit</Button>
            )}
            {auth.isLoggedIn && (
              <Button danger onClick={showDeleteHandler}>
                Delete
              </Button>
            )}
          </div>
        </Card>
      </li>
    </>
  );
};

export default PlaceItem;
