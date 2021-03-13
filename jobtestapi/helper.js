const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const docxFilter = function(req, file, cb) {
    if (!file.originalname.match(/\.(docx)$/)) {
        req.fileValidationError = 'Only docx files are allowed!';
        return cb(new Error('Only docx files are allowed!'), false);
    }
    cb(null, true);
}
const htmlFilter = function(req, file, cb) {
    if (!file.originalname.match(/\.(html)$/)) {
        req.fileValidationError = 'Only html files are allowed!';
        return cb(new Error('Only html files are allowed!'), false);
    }
    cb(null, true);
}
module.exports = { imageFilter, docxFilter, htmlFilter };