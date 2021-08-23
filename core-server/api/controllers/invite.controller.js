const { Users, Invitation, Friends } = require("../models");
const APIError = require("../utils/APIError");
const { sendPushNotification } = require("../services/notification.service");

const inviteUser = async (req, res, next) => {
  try {
    let { email } = req.body;
    let { first_name, last_name } = req.user;
    let userExist = await Users.findOne({ email });
    if (userExist && userExist.is_verified) {
      const invitationObj = await Invitation.findOne({
        $or: [
          { fromUser: userExist._id, toUser: req.user._id },
          { toUser: userExist._id, fromUser: req.user._id },
        ],
      });
      if (!invitationObj) {
        // send push notification to user
        const message = {
          notification: {
            title: `Friend request`,
            body: `${req.user.first_name} ${req.user.last_name} has sent you request`,
          },
          data: {
            type: "invite",
          },
        };
        await sendPushNotification(userExist.deviceToken, message);
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
          message: "Please check your invitations list it should be there",
          status: 400,
        });
      }
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
    let { invitationId, status } = req.body;
    let { _id } = req.user;
    const invitationObj = await Invitation.findOneAndUpdate(
      { _id: invitationId, toUser: _id },
      { status },
      { new: true }
    ).populate("fromUser");
    if (status === "accepted") {
      await Friends.findOneAndUpdate(
        { user: _id },
        { $addToSet: { contacts: invitationObj.fromUser } },
        { new: true, upsert: true }
      );
      const message = {
        notification: {
          title: `Friend request`,
          body: `${req.user.first_name} ${req.user.last_name} has accepted your request`,
        },
        data: {
          type: "user_list",
        },
      };
      await sendPushNotification(invitationObj.fromUser.deviceToken, message);
    }
    return res.send({
      message:
        status === "accepted" ? "User added successfully." : "Invite Declined.",
      success: true,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getAllInvitations = async (req, res, next) => {
  try {
    const inviations = await Invitation.find({
      toUser: req.user._id,
      status: "created",
    }).populate("fromUser");
    return res.status(200).json({
      message: "Invitations list",
      data: inviations,
    });
  } catch (err) {
    next(err);
  }
};

const deleteAllInvitations = async (req, res, next) => {
  try {
    const inviations = await Invitation.remove({});
    return res.status(200).json({
      message: "All Invitations deleted",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  inviteUser,
  manageInvite,
  getAllInvitations,
  deleteAllInvitations,
};
