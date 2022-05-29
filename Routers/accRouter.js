const express = require("express");
const router = express.Router();
const { verify } = require("./../middlewares/middleware");
const path = require("path");

const accountController = require("../controllers/accountController");
const houseController = require("../controllers/houseController");
const dmController = require("../controllers/dmController");
const messageController = require("../controllers/messageController");

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

// LAZY LOAD MESSAGES
router
  .route("/api/lazyLoadMessages")
  .post(verify, messageController.lazyLoadMessages);

module.exports = router;
