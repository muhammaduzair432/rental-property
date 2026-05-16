import multer from "multer"

const store = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/Temp")
    },
    filename:function(req,file,cb){
        cb( null,file.originalname)
    }
})
export const uploadfile=multer({
    storage:store,
})