import fs from "fs";
import { User } from "../../model/user";
import { UPLOADS } from "../../service/cloudinary";

export const UploadProfilePicture = async function (req, res, next) {
  const imageUrl = req.file;
  const { userID } = req;
  try {
    // TODO check if user exist
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, "User does not exists");
    }

    // cloudinary file uploader api
    const uploader = async function (path) {
      const result = await UPLOADS(path, "Images");
      return result;
    };
    const { result } = await uploader(imageUrl.path);
    fs.unlinkSync(imageUrl.path);
    user.imageUrl = result.url;
    const [u] = await Promise.all([user.save()]);
    if (!u) {
      ErrorException(404, "Upload not successful");
    }
    res.status(200).json({
      message: "Successfully uploaded profile picture",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
