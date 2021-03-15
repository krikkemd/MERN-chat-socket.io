import { useState } from 'react';
import axios from '../config/axios';

const url = `http://localhost:1337/api/v1/users/updateMe`;

const UploadAvatar = () => {
  const [file, setFile] = useState(null);

  const handleChange = e => {
    console.log(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const data = new FormData();
    data.append('avatar', file);
    axios
      .patch(url, data)
      .then(res => {
        console.log(res);
        setFile(null);
      })
      .catch(err => console.log(err));
  };

  return (
    <>
      <input type='file' accept='image/*' name='avatar' id='avatar' onChange={handleChange}></input>
      <button type='submit' onClick={handleSubmit}>
        Upload
      </button>
    </>
  );
};

export default UploadAvatar;
