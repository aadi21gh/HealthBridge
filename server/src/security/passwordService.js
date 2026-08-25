import argon2 from 'argon2';

/**
 * Hash a password using Argon2id (recommended variant for password hashing).
 */
export const hashPassword = async (password) => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
};

/**
 * Verify a password against a stored hash.
 * Returns true if the password matches, false otherwise.
 * Always runs in constant time (argon2 handles this internally).
 */
export const verifyPassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};
