const Post = require("../models/Post");     // schema of post imported
const User = require("../models/User");

exports.createPost = async(req, res) => {
    try {
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: "req.body.public_id",
                url: "req.body.url",
            },
            // here we can use the user object because we have taken a reference of "User" schema in
            // owner field while definening the schema
            // here everywhere, _id is the id of the current logged-in user
            owner: req.user._id,
        };
        // creating a new post
        const newPost = await Post.create(newPostData);

        // at the same time storing posts in the user account
        const user = await User.findById(req.user._id);
        user.posts.push(newPost._id);
        
        await user.save();
        res.status(201).json({
            success: true,
            newPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deletePost = async (req,res) => {
    try {
        
        const post = await Post.findById(req.params.id);

        // if invalid id provided
        if(!post) {
            return res.status(404).json({
                message: "Post not found!",
            });
        }

        // only owner can delete the post
        if(post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "You can't delete the post"
            })
        }

        await Post.deleteOne(post);

        // also need to remove this post from the user account
        
        // getting the owner
        const user = await User.findById(req.user._id);

        // getting the index of the id of this post in the posts array
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index,1);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Post deleted succesfully"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}

exports.likeAndUnlikePost = async (req,res) => {
    try {
        
        // getting the post
        const post = await Post.findById(req.params.id);

        // if wrong post-id provided
        if(!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // if post is already liked, so unlike it
        if(post.likes.includes(req.user._id)) {
            // getting the index of the id of the post from the likes array
            // and remove the id of this post, so this is basically unliking it
            const index = post.likes.indexOf(req.user._id);

            // removing it
            post.likes.splice(index, 1);
            
            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Unliked",
            });
        }

        // like it
        else {
            // push the id of the user
            post.likes.push(req.user._id);

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Liked"
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}

exports.updateCaption = async (req,res) => {
    try {
        
        const post = await Post.findById(req.params.id);

        // post doesn't exist
        if(!post) {
            return res.status(500).json({
                success: false,
                message: "Post not found"
            });
        }

        if(post.owner.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Only owner can edit the caption"
            })
        }

        post.caption = req.body.caption;
        await post.save();

        res.status(200).json({
            success: true,
            message: "Caption updated"
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}