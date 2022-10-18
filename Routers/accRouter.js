const express = require("express");
const router = express.Router();
const { verify } = require("./../middlewares/middleware");
const path = require("path");

const accountController = require("../controllers/accountController");
const houseController = require("../controllers/houseController");
const dmController = require("../controllers/dmController");
const messageController = require("../controllers/messageController");
const houseMessageController = require("../controllers/houseMessageController");

// MULTER
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "./../public/img"));
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadImage = multer({ storage: storage });
// MULTER
router
  .route("/api/signup")
  .post(uploadImage.single("image"), accountController.createAccount);

router.route("/api/login").post(accountController.loginAccount);

// GET ALL THE HOUSES A USER IS IN
router.route("/api/house").get(verify, accountController.getHouses);

// GET A SPECIFIC HOUSE BASED ON THE HOUSE ID (USED WITH accountController.getHouses)
router.route("/api/getHouse").post(verify, houseController.getHouse);

//CREATE A NEW HOUSE
router.route("/api/createHouse").post(verify, houseController.createHouse);

// GET ALL THE DMS OF A USER
router.route("/api/getAllDms").get(verify, accountController.getAllDms);

// GET A SPECIFIC DM (USED WITH accountController.getAllDms )
router.route("/api/getDm").post(verify, accountController.getDm);

// ADD A NEW DM
router.route("/api/addNewDm").post(verify, dmController.addNewDm);

// GET BASIC DATA ABOUT THE USER
router.route("/api/getBasicData").get(verify, accountController.getBasicData);

// GET BASIC DATA ABOUT THE SOME OTHER USER
router
  .route("/api/getUserBasicData")
  .post(verify, accountController.getUserBasicData);

// ADD A NEW MESSAGE FOR THAT DM
router.route("/api/saveMessage").post(verify, messageController.saveMessage);

// EDIT A DM MESSAGE
router.route("/api/editMessage").post(verify, messageController.editMessage);

// LAZY LOAD MESSAGES
router
  .route("/api/lazyLoadMessages")
  .post(verify, messageController.lazyLoadMessages);

//JOIN A HOUSE
router.route("/api/joinhouse").post(verify, houseController.joinHouse);

//SAVE A MESSAGE FROM A HOUSE
router
  .route("/api/saveHouseMessage")
  .post(verify, houseMessageController.saveHouseMessage);

//EDIT HOUSE MESSAGE
router
  .route("/api/editHouseMessage")
  .post(verify, houseMessageController.editHouseMessage);

// LAZY LOAD HOUSE MESSAGES
router
  .route("/api/lazyLoadHouseMessages")
  .post(verify, houseMessageController.lazyLoadHouseMessages);

// CHANGE NAME AND IMAGE OF AN USER
router
  .route("/api/changeData")
  .post(verify, uploadImage.single("image"), accountController.changeData);

// CHANGE NAME AND IMAGE OF AN HOUSE
router
  .route("/api/changeHouseData")
  .post(verify, uploadImage.single("image"), houseController.changeHouseData);

// GET ALL FRIENDS list
router.route("/api/getAllFriends").get(verify, accountController.getAllFriends);

// GET PENDING REQUESTS list
router
  .route("/api/getAllPendingRequests")
  .get(verify, accountController.getAllPendingRequests);

// ADD FRIENDS
router.route("/api/addFriends").post(verify, accountController.addFriends);

// REJECT REQUESTS
router
  .route("/api/rejectRequest")
  .post(verify, accountController.rejectRequest);

// ACCEPT REQUEST
router
  .route("/api/acceptRequest")
  .post(verify, accountController.acceptRequest);

// GET ALL THE USERS IN A DM
router.route("/api/getDMUsers").post(verify, dmController.getDMUsers);

// GET DETAILED DETAILS OF ALL MEMBERS IN A HOUSE
router
  .route("/api/getHouseDetailed")
  .post(verify, houseController.getHouseDetailed);

// CREATE A NEW TEXT CHANNEL IN A HOUSE
router
  .route("/api/createTextChannel")
  .post(verify, houseController.createTextChannel);

// CREATE A NEW VOICE CHANNEL IN A HOUSE
router
  .route("/api/createVoiceChannel")
  .post(verify, houseController.createVoiceChannel);

// CHANGE USER COVER IMAGE AND ABOUT ME

router
  .route("/api/changeSecondaryData")
  .post(
    verify,
    uploadImage.single("image"),
    accountController.changeSecondaryData
  );

module.exports = router;
