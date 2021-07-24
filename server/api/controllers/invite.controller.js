const { Users, Invitation, Friends } = require("../models");
const APIError = require("../utils/APIError");

const inviteUser = async (req, res, next) => {
  try {
    let { email } = req.body;
    let { first_name, last_name } = req.user;
    let userExist = await Users.findOne({ email, is_verified: true });
    if (userExist) {
      // send push notification to user

      await Invitation.findOneAndUpdate(
        { fromUser: req.user._id, toUser: userExist._id },
        { fromUser: req.user._id, toUser: userExist._id },
        { setDefaultsOnInsert: true, new: true, upsert: true }
      );

      return res.send({
        message: "Invitation has been sent successfully.",
      });
    } else {
      throw new APIError({
        message:
          "Sorry, Your friend does not have verified account with RogerThat, Please ask him/her to sign up",
        status: 400,
      });
    }
  } catch (err) {
    next(err);
  }
};

const manageInvite = async (req, res, next) => {
  try {
    let { invitationId, isAccepted } = req.body;
    let { _id } = req.user;
    const invitationObj = await Invitation.findOneAndUpdate(
      { _id: invitationId, toUser: _id },
      { isAccepted },
      { new: true }
    );
    if(isAccepted){
      await Friends.findOneAndUpdate(
        { user: _id },
        { $addToSet: { contacts: invitationObj.fromUser } },
        { new: true, upsert: true }
      );
    }
    return res.send({
      message: isAccepted ? "User added successfully." : "Invite Declined.",
      success: true,
    });
  } catch (error) {
    next(err);
  }
};

const getAllInvitations = async (req, res, next) => {
  try {
    const inviations = await Invitation.find({ toUser: req.user._id }).populate(
      "fromUser"
    );
    return res.status(200).json({
      message: "Invitations list",
      data: inviations,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { inviteUser, manageInvite, getAllInvitations };
