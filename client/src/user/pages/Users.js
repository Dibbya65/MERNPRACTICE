import React, { useEffect, useState } from 'react';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import UsersList from '../components/UserLists/UsersList';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUser, setLoadedUser] = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const resData = await sendRequest('http://127.0.0.1:5000/api/users');

        setLoadedUser(resData.users);
      } catch (error) {}
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className='center'>
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && <UsersList items={loadedUser} />}
    </>
  );
};

export default Users;
