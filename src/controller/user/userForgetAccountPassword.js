import bcrypt from 'bcrypt';
import { User } from '../../model/user';
import { Response, Request } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from './userAccountService';
import { ErrorExceptionMessage } from '../../util/error';
import { validationResult } from 'express-validator';


/**
 * @typedef {Request} req
 * @typedef {Response} res
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @param  {Function} next next middleware function
 * @author  Paulsimon Edache
 */
const UserForgetPassword = async function (req, res, next) {
  const { password1, password2, email } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      res.status(406).json({
        error: errors.mapped(),
      });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      ErrorExceptionMessage(404, `${email} not found`);
    }
    if (email !== user.email) {
      ErrorExceptionMessage(404, `${email} is not a registered on this application `);
    }
    if (user.isVerified == false) {
      ErrorExceptionMessage(404, `${email} your email is not verified`);
    }
    const isMatch = await bcrypt.compare(password1, user.password);
    if (isMatch) {
      ErrorExceptionMessage(
        406,
        'new password must not be the same with the old password'
      );
    }

    if(password1 !== password2){
      ErrorExceptionMessage(
        406,
        'password did not match'
      );
    }

    const payload = {
      id: user.id,
    };

    const hash_password = await bcrypt.hash(password, 10);
    const accessToken = signAccessToken(user.id, payload);
    const verifyIdToken = verifyAccessToken(accessToken);
    const refreshToken = signRefreshToken(user.id, payload);

    // Storing the hashed password and the refresh token
    // to the password and refresh token model field.
    user.password = hash_password;
    user.refToken = refreshToken;

    // Model Saved
    await user.save();

    // Returned Payload
    res.status(200).json({
      message: 'OK',
      email: user.email,
      user_id: user._id,
      username: user.username,
      id_token: accessToken,
      refresh_token: refreshToken,
      expires_in: verifyIdToken.exp,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export default UserForgetPassword;
