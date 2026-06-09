import client from './client';

export interface ChildProfile {
  childId: number;
  childName: string;
  birthDate: string;
  age: number;
  ageGroup: string;
  concerns: string[];
}

export async function fetchChildren(): Promise<ChildProfile[]> {
  const res = await client.get('/api/children');
  console.log('fetchChildren 원본 응답:', JSON.stringify(res.data));
  return res.data.data ?? [];
}

export async function registerChild(data: {
  childName: string;
  birthDate: string;
  concerns: string[];
}): Promise<ChildProfile> {
  const res = await client.post('/api/children', data);
  return res.data.data;
}

export async function updateChild(childId: number, data: {
  childName: string;
  birthDate: string;
  concerns: string[];
}): Promise<ChildProfile> {
  const res = await client.put(`/api/children/${childId}`, data);
  return res.data.data;
}