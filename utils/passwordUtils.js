// utils/auth.js
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * Hashes a plain text password.
 * @param {string} plainTextPassword - The password to hash.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 */
const hashPassword = async (plainTextPassword) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed'); // Or handle more gracefully
  }
};

/**
 * Compares a plain text password with a hashed password.
 * @param {string} plainTextPassword - The plain text password from user input.
 * @param {string} hashedPasswordFromDb - The hashed password stored in the database.
 * @returns {Promise<boolean>} - A promise that resolves to true if passwords match, false otherwise.
 */
const comparePasswords = async (plainTextPassword, hashedPasswordFromDb) => {
  try {
    const match = await bcrypt.compare(plainTextPassword, hashedPasswordFromDb);
    return match;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Password comparison failed'); // Or handle more gracefully
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
};