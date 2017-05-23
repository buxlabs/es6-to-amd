import hash from 'hash';

export function guid() {
  return hash('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
}