import React, { useEffect, useState } from 'react';

const Services: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(users => setUsers(users.filter(u => u.role === 'USER')));
  }, []);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default Services; 