import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const scrypt = (password, salt) => new Promise((resolve, reject) => {
  scryptCallback(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
    if (error) reject(error);
    else resolve(key);
  });
});

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$16384$8$1$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(encoded, password) {
  const [algorithm, n, r, p, saltHex, keyHex] = encoded.split('$');
  if (algorithm !== 'scrypt' || n !== '16384' || r !== '8' || p !== '1' || !/^[0-9a-f]{32}$/.test(saltHex || '') || !/^[0-9a-f]{128}$/.test(keyHex || '')) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'));
  return timingSafeEqual(actual, expected);
}
