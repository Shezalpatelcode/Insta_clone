let mongoose= require('mongoose')
let uploadSchema=   mongoose.Schema({
    imgUrl:{
        type:String,
        // require:true
    },
    likeCount:{
        type:Number,
        default:0
    }
    ,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }]


})

 let Upload=   mongoose.model('Upload',uploadSchema)

 module.exports=Upload