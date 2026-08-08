import multer from "multer"

const store = multer.memoryStorage()
export const uploadfile=multer({
    storage:store,
})