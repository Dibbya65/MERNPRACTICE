import React from 'react';
import Card from '../../../shared/components/UIElements/Card';
import UserList from './UserList/UserList';
import './UsersList.css';

const UsersList = (props) => {
  //   console.log(props?.items);
  return (
    <>
      {props?.items?.length > 0 ? (
        <ul className='users-list'>
          {props.items.map((user) => (
            <UserList
              key={user.id}
              id={user.id}
              image={user.image}
              name={user.name}
              placeCount={user.places.length}
            />
          ))}
        </ul>
      ) : (
        <div className='center'>
          <Card>
            <h2>No users found</h2>
          </Card>
        </div>
      )}
    </>
  );
};

export default UsersList;
