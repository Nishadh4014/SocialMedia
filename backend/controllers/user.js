const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");


// sign up
exports.register = async (req,res) => {

    try {
        
        const {name,email,password} = req.body;

        let user = await User.findOne({name});
        if(user) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        user = await User.create({
            name,
            email,
            password,
            avatar: {public_id: "sample_id", url: "sampleurl"},
        });

        // user will directly log-in after registering
        const token = await user.generateToken();
        const options = {
            expires: new Date(Date.now() + 90*24*60*60*1000),
            httponly: true,
        };


        res.status(201).cookie("token",token,options).json({
            success: true,
            user,
            token,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

};


// sign-in
exports.login = async (req,res) => {

    try {
        const {name,password} = req.body;
        
        // verifying user name
        // when i defined the schema, there was a field in the password, "select: false" which denies to access the password but we need this
        // while comparing the entered password while login with the password when he signed-up which is basically stored in the database
        const user = await User.findOne({name}).select("+password");      
    
        if(!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exist",
            });
        }

        // verifying user password
        const isMatch = await user.matchPassword(password);

        if(!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password",
            });
        }

        // user verified, so store him in the cookie!!
        const token = await user.generateToken();
        const options = {
            expires: new Date(Date.now() + 90*24*60*60*1000),
            httponly: true,
        };


        res.status(200).cookie("token",token,options).json({
            success: true,
            user,
            token,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An erroe occured",
        });
    }
}

// follow user
exports.followUser = async (req,res) => {
    try {
        const user_to_be_followed = await User.findById(req.params.id);

        // if that user doesn't exist
        if(!user_to_be_followed) {
            return res.status(401).json({
                success: false,
                message: "User doesn't exist"
            });
        }

        // getting the current(logged-in) user
        const user = await User.findById(req.user._id);

        // if the user already follows him
        if(user.following.includes(req.params.id)) {
            return res.status(201).json({
                success: true,
                message: "Already following " + user_to_be_followed.name
            });
        } else {
            // updated my followings
            user.following.push(req.params.id);
            await user.save();

            // updated the followers of the user whom i followed
            user_to_be_followed.followers.push(req.user._id);
            await user_to_be_followed.save();

            return res.status(200).json({
                success: true,
                message: "Following " + user_to_be_followed.name
            })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

// Unfollow a user
exports.unfollowUser = async (req,res) => {
    try {
        
        const user_to_be_unfollowed = await User.findById(req.params.id);

        // if that user doesn't exist
        if(!user_to_be_unfollowed) {
            return res.status(404).json({
                success: false,
                message: "User dosen't exist"
            });
        } else {
            // need to check whether i am following him or not
            const user = await User.findById(req.user._id);

            // already not following
            if(!(user.following.includes(req.params.id))) {
                return res.status(201).json({
                    success: true,
                    message: "Not following " + user_to_be_unfollowed.name
                });
            } else {
                // getting the index of id of the user_to_be_unfollowed in the current user's following array
                const index1 = user.following.indexOf(req.params.id);
                // getting the index of id of the current user in the user_to_be_unfollowed's followers array
                const index2 = user_to_be_unfollowed.followers.indexOf(req.user._id);

                user.following.splice(index1,1);
                await user.save();

                user_to_be_unfollowed.followers.splice(index2,1);
                await user_to_be_unfollowed.save();

                return res.status(200).json({
                    success: true,
                    message: "Unfollowed " + user_to_be_unfollowed.name
                })
            }
        }

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
}

// show posts of users whom i'm following
exports.getPostOfFollowing = async (req,res) => {
    try {
        // we need the posts of people whom i'm following
        // can be done in two ways

        // getting the current user
        const user = await User.findById(req.user._id);

        // way : 1
        // iterate over all the current posts and check whether it's owener's 
        // id is matching with one of the people whom i'm following
        const posts = await Post.find({
            owner: {
                $in: user.following,
            }
        })

        res.status(200).json({
            success: true,
            posts
        });
        
        // way : 2
        // populate the posts of the following ids
        
        // basically what populate does?
        // so it will populate the whole user data from just user's id
        // so here we have stored the user ids whom i'm following
        // so i can just populate those users and access their posts
        // but there one more efficient way is to just populate their posts instead of whole data
        
        // const user = await User.findById(req.user._id).populate(
        //     "following",
        //     "posts"
        // );
        // res.status(200).json({
        //     success: true,
        //     following: user.following
        // })


    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
}

// log-out
exports.logout = async (req,res) => {
    try {
        res.status(200)
        .cookie("token",null,{ expires: new Date(Date.now()), httponly: true })
        .json({
            success: true,
            message: "Successfully logged-out!"
        })
    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
}

// update a password
exports.updatePassword = async(req,res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");  // again need to access the password here!!

        const {oldPassword, newPassword} = req.body;
        
        if(!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Please provide old and new passwords"
            })
        }

        const isMatch = await user.matchPassword(oldPassword);

        if(!isMatch) {
            return res.status(400).json({
                success: false,
                message:  "Incorrect old password"
            })
        } else {
            user.password = newPassword;
            await user.save();

            res.status(201).json({
                success: true,
                message: "Password updated successfully"
            })
        }
    } catch (error) {
        return res.status(404).json({
            message: error.message
        });   
    }
}


// update a profile
exports.updateProfile = async (req,res) => {
    try {
        const user = await User.findById(req.user._id);
        const {newName, newEmail} = req.body;

        // if he entered the name
        if(newName) {
            user.name = newName;
        }
        await user.save();
        if(newEmail) {
            user.email = newEmail;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated"
        });
    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
}

// show my profile
exports.myProfile = async (req,res) => {
    try {
        
        const user = User.findById(req.user._id);

        res.status(200).json({
            success: true,
            message : "Kem chho"
        });

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
}


// delete my profile
exports.deleteProfile = async (req,res) => {
    try {
        // need to remove the user and have to remove his all the posts and remove him from followers list as well
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followings = user.following;

        await User.deleteOne(user);

        // after deleting the profile, user must be get automatically logged-out
        res.cookie("token",null,{
            expires: new Date(Date.now()),
            httponly: true,
        });

        // Delete all the posts of the user
        for(let i=0;i<posts.length;i++) {
            const post = await Post.findById(posts[i]);
            Post.deleteOne(post);
        }

        // Delete him from followers list
        for(let i=0;i<followings.length;i++) {
            const user_to_whom_im_following = await User.findById(followings[i]);
            const index = user_to_whom_im_following.followers.indexOf(req.user._id);
            user_to_whom_im_following.followers.splice(index,1);
            await user_to_whom_im_following.save();
        }

        res.status(201).json({
            success: true,
            message: "Profile deleted"
        })
    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
}