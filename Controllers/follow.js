const Follow = require('../Modals/followModal');
const Notification = require('../Modals/NotificationModel');
const User = require('../Modals/userModal');
const asynchandler = require('express-async-handler');


const follow = asynchandler(async (req, res) => {
    try {
      const { userIdToFollow } = req.body;
      const currentUserId = req.user._id;
  
      if (!userIdToFollow || !currentUserId) {
        return res.status(400).json({ status: false, message: "User IDs are required" });
      }
  
      // Check if already following
      const existingFollow = await Follow.findOne({
        follower: currentUserId,
        following: userIdToFollow,
      });
  
      if (existingFollow) {
        return res.status(400).json({ status: false, message: "Already following this user" });
      }
  
      // Create follow relationship
      const follow = new Follow({
        follower: currentUserId,
        following: userIdToFollow,
      });
      await follow.save();
  
      // Create a notification for the followed user
      await Notification.create({
        recipient: userIdToFollow, // Who receives the notification
        sender: currentUserId,     // Who triggered it
        type: "follow",
      });
  
      res.status(200).json({ status: true, message: "Followed successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server Error" });
    }
  });
  



  const unfollow = asynchandler(async (req, res) => {
    try {
      const { userIdToUnfollow } = req.body;
      const currentUserId = req.user._id;
  
      if (!userIdToUnfollow || !currentUserId) {
        return res.status(400).json({ status: false, message: "User IDs are required" });
      }
  
      // Remove follow relationship
      const follow = await Follow.findOneAndDelete({
        follower: currentUserId,
        following: userIdToUnfollow,
      });
  
      if (!follow) {
        return res.status(404).json({ status: false, message: "Follow relationship not found" });
      }
  
      // Create a notification for the unfollowed user
      await Notification.create({
        recipient: userIdToUnfollow,
        sender: currentUserId,
        type: "unfollow",
      });
  
      res.status(200).json({ status: true, message: "Unfollowed successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server Error" });
    }
  });
  
const myFollowers = asynchandler(async (req, res) => {
    try {
        const userId = req.user._id; 
        console.log("userId" , userId);

        const followers = await Follow.find({ following: userId }).populate('follower');
        console.log("followers" , followers);

        if (!followers.length) {
            return res.status(404).json({ status : false, message: 'You have no followers' });
        }
        res.status(200).json({
            status : true, 
            message: 'list',
            followers: followers.map(follow => follow.follower)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status : false, message: 'Server Error' });
    }
});

const myFollowing = asynchandler(async (req, res) => {
    try {
        const userId = req.user._id; 
        const following = await Follow.find({ follower: userId }).populate('following');
        if (!following.length) {
            return res.status(404).json({ status : false,message: 'You are not following anyone' });
        }
        res.status(200).json({
            status : true, 
            message: 'list',
            following: following.map(follow => follow.following)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status : false, message: 'Server Error' });
    }
});

const getNotifications = asynchandler(async (req, res) => {
    try {
      const userId = req.user._id;
  
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 }) // Latest first
        .populate("sender", "name username avatar"); // Include sender details
  
      res.status(200).json({ status: true, data: notifications });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server Error" });
    }
  });
  const markAllNotificationsAsRead = asynchandler(async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Update all unread notifications for this user
      const result = await Notification.updateMany(
        { 
          recipient: userId,
          read: false 
        },
        { 
          $set: { read: true } 
        }
      );
  
      res.status(200).json({ 
        status: true, 
        message: "All notifications marked as read",
        data: {
          modifiedCount: result.modifiedCount
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server Error" });
    }
  });

module.exports = { follow, unfollow, myFollowers, myFollowing , getNotifications, markAllNotificationsAsRead };