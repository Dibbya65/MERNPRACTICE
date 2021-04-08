import React from 'react';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import PlaceItem from './PlaceItem';
import './PlaceList.css';

const PlaceList = (props) => {
  return (
    <>
      {props?.items?.length > 0 ? (
        <ul className='place-list'>
          {props.items.map((place) => (
            <PlaceItem
              key={place.id}
              id={place.id}
              image={place.image}
              title={place.title}
              description={place.description}
              address={place.address}
              creatorId={place.creator}
              coordinates={place.location}
              onDelete={props.onDeletePlace}
            />
          ))}
        </ul>
      ) : (
        <div className='place-list center'>
          <Card>
            <h2>No Places found.Create one?</h2>
            <Button to='/places/new'>Share Place</Button>
          </Card>
        </div>
      )}
    </>
  );
};

export default PlaceList;
