import express from "express"
import { libraryController } from "./library.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import validateRequest from "../../middlewares/validateRequest";
import { libraryValidation } from "./library.validation";
import { USER_ROLE } from "../user/user.constant";
import auth from "../../middlewares/auth";

const router = express.Router()

// Define the upload folder
const UPLOADS_FOLDER_USER_DOCUMENTS = 'uploads/library';
const upload = fileUploadHandler(UPLOADS_FOLDER_USER_DOCUMENTS)


router.post(
    '/create',
    // validateRequest(libraryValidation.fileUploadSchema),
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin),
     upload.fields([
    {
      name: "fileUrl",
      maxCount: 1
    },
    {
      name: "thumbnailUrl",
      maxCount:1
    }
  ]),
    libraryController.createLibraryItem
)
router.get(
    '/get-all',
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin, USER_ROLE.user),
    libraryController.readAllCreateLibraryItem
)
router.delete(
    '/delete/:id',
    auth(USER_ROLE.admin , USER_ROLE.superAdmin),
    libraryController.deleteLibraryItem
)

// update and get by id route need to add

router.get(
  '/get-single/:itemId',
  auth(USER_ROLE.admin , USER_ROLE.superAdmin, USER_ROLE.user, USER_ROLE.analyst),
  libraryController.getOneItemById
)

router.patch(
    '/update/:LId',
    // validateRequest(libraryValidation.fileUploadSchema),
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin),
     upload.fields([
    {
      name: "fileUrl",
      maxCount: 1
    },
    {
      name: "thumbnailUrl",
      maxCount:1
    }
  ]),
    libraryController.updateLibraryItem
)


export const LibraryRoute = router;