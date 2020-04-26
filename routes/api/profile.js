const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

//@route  GET api/profile/me
//@desc   Get current users profile
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    // Find a profile with user id and fetch 'name' and 'avatar'
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({
        message: "There is no profile for this user.",
      });
    }
    res.json(profile);
  } catch (error) {
    if (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
});

//@route  POST api/profile
//@desc   Create or update user profile
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    CheckErrors(req);
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    // Build Profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (location) profileFields.location = location;
    if (website) profileFields.website = website;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build Social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({
        user: req.user.id,
      });
      if (profile) {
        // Update profile
        profile = await Profile.findOneAndUpdate(
          {
            user: req.user.id,
          },
          {
            $set: profileFields,
          },
          {
            new: true,
          }
        );
        return res.json(profile);
      }

      // Create profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route  GET api/profile
//@desc   Get all profiles
//@access Public
router.get("/", async (req, res) => {
  try {
    // Get all profiles with user details like name, avatar
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route  GET api/profile/user/:user_id
//@desc   Get profile by user id
//@access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    // Get profile by user id with user details like name, avatar
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({
        message: "Profile not found.",
      });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.name == "CastError") {
      return res.status(400).json({
        message: "Profile not found.",
      });
    }
    res.status(500).send("Server Error");
  }
});

//@route  DELETE api/profile
//@desc   Delete profile, user & posts
//@access Private
router.delete("/", auth, async (req, res) => {
  try {
    // Remove Profile
    await Profile.findOneAndRemove({
      user: req.user.id,
    });
    // Remove User
    await User.findOneAndRemove({
      _id: req.user.id,
    });
    res.json({
      message: "User deleted.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route  PATCH api/profile/experience
//@desc   Add experience to profile
//@access Private
router.patch(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    CheckErrors(req);
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // unshift is similar to push() but it pushes to the begining rather than to the end.
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Check if there are any validation errors in the request.
function CheckErrors(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
}

module.exports = router;
