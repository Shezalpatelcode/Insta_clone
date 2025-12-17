let express= require('express')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let User=require('./User')
require("dotenv").config();
let mongoose= require('mongoose')
let Upload =require('./Upload')
// let Comment =require('./Coment')
const Story = require("./story");
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("db.....");
    
})

// mongoose.connect(process.env.MONGO_URL)
//   .then(() => console.log("MongoDB Atlas Connected"))
//   .catch(err => console.log(err));

let cors= require('cors')

let app=  express()
app.use(cors())
app.use(express.json())
app.get('/',(req,res)=>{
    res.send("hello")

})



app.post("/signUp", async (req, res) => {
    try {
      const { name, email, passWord } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ msg: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(passWord, 10);
      const newUser = new User({ name, email, passWord: hashedPassword });
      await newUser.save();
  
      res.json({ msg: "Signup successful", user: newUser });
    } catch (err) {
     return  res.status(500).json({ msg: "Error during signup", error: err.message });
    }
  });

  app.post("/login", async (req, res) => {
    try {
      const { email, passWord } = req.body;
      const user = await User.findOne({ email });
      console.log(user ,"user");
      if (!user) return res.status(404).json({ msg: "User not found" });
  
      console.log("Plain Password:", passWord);
  console.log("Hashed from DB:", user.passWord);
  
      const isMatch = await bcrypt.compare(passWord, user.passWord);
      if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });
  
     const token = jwt.sign(
    { _id: user._id, email: user.email, role: user.role || "user" },
    "SECRET123",
    { expiresIn: "1h" }
  );
  
  
  res.json({
    msg: "Login successful",
    token,
    user: { _id: user._id, name: user.name, email: user.email }
  });
    } catch (err) {
     return res.status(500).json({ msg: "Error during login", error: err.message });
    }

})



// middleware/auth.js


let auth = function(req, res, next) {
    const token = req.headers.authorization;
    console.log("header",req.headers)
    // console.log("hello",token);
    if (!token) return res.status(401).json({ message: "Login first!" });

    try {
        const decoded = jwt.verify(token, "SECRET123");
        console.log(decoded,"kyaya ");
        
        req.user = decoded;   // IMPORTANT: req.user yahi se aata hai
        console.log("decoded",decoded);
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};



app.post("/story", auth, async (req, res) => {
  const { mediaUrl } = req.body;
  if (!mediaUrl) return res.status(400).json({ msg: "media required" });

  const story = new Story({
    mediaUrl,
    user: req.user._id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  await story.save();
  res.json({ msg: "Story uploaded" });
});



app.get("/stories", auth, async (req, res) => {
  const me = await User.findById(req.user._id);

  const allowedUsers = [
    req.user._id,
    ...me.following,
    ...me.followers,
  ];

  const stories = await Story.find({
    user: { $in: allowedUsers },
    expiresAt: { $gt: new Date() }, // not expired
  })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json(stories);
});

// app.post('/upload', auth, async(req,res)=>{
//   const userId = req.user._id;  
//   const { imgUrl } = req.body;
//   if(!imgUrl){
//       return res.send("URL not found")
//   }
//   let uploadD = new Upload({
//       imgUrl,
//       user: userId,      
//       likedBy: []
//   })
//   await uploadD.save();
//   return res.send("uploaded");
// })


app.get("/upload", auth, async (req, res) => {
  try {
    const posts = await Upload.find()
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const postsWithCount = await Promise.all(
      posts.map(async (post) => {
        const count = await Comment.countDocuments({
          post: post._id,
        });

        return {
          ...post.toObject(),
          commentsCount: count, // 🔥 VERY IMPORTANT
        };
      })
    );

    res.json(postsWithCount);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});



// Uploads ko fetch karne ke liye
app.get("/upload", auth, async (req, res) => {
  try {
    const posts = await Upload.find()
      .populate("user", "name email")   // user ka naam chahiye
      .sort({ createdAt: -1 });         // latest first (agar schema me timestamps: true hai)

    res.json(posts);
  } catch (err) {
    console.error("GET /upload error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


app.post("/like/:id", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Upload.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

   
    post.likedBy = post.likedBy.filter(id => id !== null);


    const alreadyLiked = post.likedBy.some(
      id => id.toString() === userId.toString()
    );

    // --------------------------------
    // 🔴 UNLIKE (agar like kiya hua hai)
    // --------------------------------
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
      post.likeCount = Math.max(0, post.likeCount - 1);

      await post.save();
      return res.json({
        success: true,
        message: "Disliked",
        likeCount: post.likeCount
      });
    }

    // --------------------------------
    // 🟢 LIKE (agar pehle like nahi kiya)
    // --------------------------------
    post.likedBy.push(userId);
    post.likeCount += 1;

    await post.save();
    return res.json({
      success: true,
      message: "Liked",
      likeCount: post.likeCount
    });



  } catch (err) {
    console.log("LIKE API ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.post("/follow/:id",auth,async(req,res)=>{
  let targetUserId=req.params.id;
  let currentUserId=req.user._id
  console.log(req.user,"hehh");
  
  if(targetUserId==currentUserId){
    res.json({msg:"nashe kam kro thoda..."})
  }
    let targetUser=   await User.findById(targetUserId)
   let currentUser=   await User.findById(currentUserId)
   if(!currentUser || !targetUser){
    res.send("user not found")
   }
   let alreadyFollow=currentUser.following.includes(targetUserId)
   console.log(alreadyFollow,"helloo");
   console.log(alreadyFollow==targetUser);
   
   
         

   if (alreadyFollow) {
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId.toString()
    );

    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    return res.json({
      success: true,
      msg: "Unfollowed successfully"
    });
  }
    //  followers
    console.log(currentUser== targetUser);
    
    currentUser.following.push(targetUserId)
    targetUser.followers.push(currentUserId)
    await currentUser.save()
    await targetUser.save()
    res.json({msg:"followed succe......"})
})

  // search?Q=
// ankita
// AN
 app.post("/search",async(req,res)=>{
      let query=   req.query.q
      if(!query){
        return  res.send("query not found")
      }
        let isMatch=    await  User.find({
            $or:[
              {name:{$regex:query,$options:"i"}},
              {email:{$regex:query,$options:"i"}}
            ]

          }).select("-passWord")
          .limit(5)
          res.json({msg:isMatch})
          console.log(isMatch);
          
 })

// Current logged-in user ka profile
app.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-passWord") // password mat bhejna
      .populate("followers", "name email")
      .populate("following", "name email");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      followers: user.followers || [],
      following: user.following || [],
    });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});




// Add this in your server file (where auth is available)
app.post("/comment/:postId", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id; // from token

    if (!text) return res.status(400).json({ msg: "text required" });
    if (!postId) return res.status(400).json({ msg: "postId required" });

    // Optional: check post exists
    const post = await Upload.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const newComment = new Comment({
      text,
      post: postId,
      user: userId
    });

    await newComment.save();

    // Optionally populate and return
    const populated = await newComment.populate("user", "name email").execPopulate?.() || await Comment.findById(newComment._id).populate("user", "name email");

    return res.status(201).json({
      msg: "Comment added successfully",
      comment: populated
    });
  } catch (error) {
    console.error("COMMENT ADD ERROR:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get comments for a particular post
app.get("/comments/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("user", "name email")   // 
      .sort({ createdAt: 1 });         

    res.json(comments);
  } catch (err) {
    console.log("GET COMMENTS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Current user ke posts
app.get("/my-posts", auth, async (req, res) => {
  try {
    const posts = await Upload.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("GET /my-posts error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});




app.post("/:postId", async (req, res) => {
  try {
    const { text, userId } = req.body;
    const { postId } = req.params;

    if (!text || !userId || !postId) {
      return res.status(400).json({ msg: "text, userId, postId required" });
    }

    const newComment = new Comment({
      text,
      post: postId,
      user: userId
    });

    await newComment.save();

    return res.status(201).json({
      msg: "Comment added successfully",
      comment: newComment
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});



















app.listen(4000,()=>{
    console.log("server running on port no 4000");
    
})