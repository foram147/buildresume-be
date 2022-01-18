import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const cloudinaryProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profileImages"
  }
})

export function uploadProfilePicture(req,res,next) {
  const upload = multer({ storage: cloudinaryProfileStorage })
  .single("image");
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      next(err)
    } else {
      next();
    }
  });
}