import client from './client';

export const getPrograms = async () => {
  const response = await client.get('/programs');
  return response.data;
};