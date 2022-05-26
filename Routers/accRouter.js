const express = require("express");
const router = express.Router();
const { verify } = require("./../middlewares/middleware");

const accountController = require("../controllers/accountController");
const houseController = require("../controllers/houseController");
const dmController = require("../controllers/dmController");

router.route("/api/signup").post(accountController.createAccount);

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

// ADD A NEW MESSAGE TO THE RESPECTIVE DM DATABASE
router.route("/api/addDms").post(verify, dmController.addDms);

// GET BASIC DATA ABOUT THE USER
router.route("/api/getBasicData").get(verify, accountController.getBasicData);

module.exports = router;
