const express = require('express')
const router = express.Router()
const User = require('../models/User')
const sercretKey = 'nguyenduchiepnguyenduchiep'
const jwt = require('jsonwebtoken')
const admin = require('firebase-admin')
    // const uuid = require('uuid-v4');
const fs = require('fs')
const multer = require('multer')
const helpers = require('../helper');
const serviceAccount = require("../path/feedbacksystem-282204-firebase-adminsdk-mqdb0-7daeea3c24.json");
const nodemailer = require("nodemailer");
const pdfparse = require("pdf-parse");
const textract = require("textract");
const queryString = require('query-string')
const https = require('https')
const axios = require('axios')
const google_util = require('../util/google_util')
const { PDFNet } = require('@pdftron/pdfnet-node')
const AdmZip = require('adm-zip');
const PdfReader = require('pdfreader').PdfReader;
const hummus = require('hummus')
const HummusRecipe = require('hummus-recipe')
const reader = new PdfReader();
const PDFDocucment = require('pdfkit')
const StreamZip = require('node-stream-zip');
const archiver = require('archiver')
const formidable = require('formidable');
const convertPDF = require('../util/convertPdf')

const isVNPhoneMobile = /((09|03|07|08|05)+([0-9]{8})\b)/g;
const isEmail = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;




const doc = new PDFDocucment()





// const { response } = require('../app/app');
const path = require('path');
const { file } = require('googleapis/build/src/apis/file')
    // router.use(express.static(__dirname + '/public'));

router.use(express.json());



// Called with each page

var projectPath = process.cwd() + "/uploads/";
const options = {}; /* see below */




// extract(projectPath + 'mypdf.pdf', (err, pages) => {
//     if (err) {
//         console.log(err)
//         return
//     }
//     console.log(pages)
// })

//doc.addPage().text()




function test() {
    // const pdfDoc = new HummusRecipe('new', projectPath + 'output.pdf', {
    //     version: 1.6,
    //     author: 'John Doe',
    //     title: 'Hummus Recipe',
    //     subject: 'A brand new PDF'
    // });
    // pdfDoc
    //     .createPage('letter-size')
    //     .endPage()
    //     .endPDF();
    // reader.parseFileItems(projectPath + "mypdf.pdf", function(err, item) {
    //     if (err) {
    //         console.log(err);
    //     } else if (!item) {
    //         console.log('Item not null');
    //     } else if (item.text) {
    //         console.log(item.text);
    //     }
    //     console.log(item);
    // });
    const pdfDoc = new HummusRecipe(projectPath + 'mypdf.pdf', projectPath + 'output.pdf');
    pdfDoc
    // edit 1st page
        .editPage(1)
        .text('Add some texts to an existing pdf file')
        .image(projectPath + 'myimage-1612760650939.jpg', 20, 100, { width: 50, height: 15, keepAspectRatio: false })
        .endPage()
        // end and save
        .endPDF();

}
//test()






admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://feedbacksystem-282204.firebaseio.com",
});

const bucket = admin.storage().bucket("feedbacksystem-282204.appspot.com");
// const db = admin.firestore();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mrhiep314@gmail.com",
        pass: "ZZNGUYENDUCHIEPZZ",
    }
});

// var mailOptions = {
//     from: 'youremail@gmail.com',
//     to: 'myfriend@yahoo.com', // muốn send nhiều thì , cái r ghi tiếp mail
//     subject: 'Sending Email using Node.js',
//     text: 'That was easy!',
//     html: '<h1>Welcome</h1><p>That was easy!</p>'
// };

router.post("/emails/send", (req, res) => {
    const mailOptions = {
        from: "mrhiep314@gmail.com",
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.text,
    };
    transporter
        .sendMail(mailOptions)
        .then((info) => {
            return res.status(200).json();
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: "Server error." });
        });

    // transporter.sendMail(mailOptions, function(err, info) {
    //     if (err) {
    //         return res.status(500).json({ message: "Server error." });
    //     } else {
    //         console.log(info);
    //         console.log(info.response);
    //         return res.status(200).json();
    //     }
    // });
});

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     // By default, multer removes file extensions so let's add them back
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });
const multer2 = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
    // fileFilter: helpers.imageFilter
});


const multer3 = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
});

const multer4 = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: helpers.docxFilter
});
const multer5 = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: helpers.htmlFilter
});


function open(filePath) { // giu lai ham nay
    return new Promise(
        function(resolve, reject) {
            const zip = new StreamZip({
                file: filePath,
                storeEntries: true
            })
            console.log(zip);

            zip.on('ready', () => {
                console.log('Ready');
                var chunks = []
                var content = ''
                zip.stream('word/document.xml', (err, stream) => {
                    if (err) {
                        reject(err)
                    }
                    stream.on('data', function(chunk) {
                        chunks.push(chunk)
                    })
                    stream.on('end', function() {
                        content = Buffer.concat(chunks)
                        zip.close()
                        resolve(content.toString())
                    })
                })
            })
        }
    )
};




router.post('/testpdf', multer3.single("file"), async(req, res) => {

    var myBuffer = req.file.buffer;
    console.log(myBuffer);
    let hope = '';
    let h = '';
    for (let index = 0; index < myBuffer.length; index++) {
        const element = myBuffer[index];
        if (element === 40) {
            h += ' ' + element
        }
        // hope += ' ' + element
    }
    console.log(h);


    console.log(myBuffer.length);


    // const myPdf = await (await pdfjs.getDocument({ data: myBuffer }).promise).getData();
    // console.log(myPdf);
    // // reader.parseBuffer(myBuffer, (err, item) => {
    // //     if (err) {
    // //         console.log(err);
    // //     } else if (!item) {
    // //         console.log(item);
    // //     } else if (item.text) {
    // //         console.log(item.text);
    // //     }
    // //     return res.status(200).json();
    // // })
    return res.status(200).json();


})




// function doJob(x, sec) {
//     return new Promise(resolve => {
//         console.log('Start: ' + x);
//         setTimeout(() => {
//             console.log('End: ' + x);
//             resolve(x);
//         }, sec * 1000);
//     });
// }

// async function SerialFlow() {

//     let result1 = await doJob(1, 5); // run sequentially
//     let result2 = await doJob(2, 5);
//     let result3 = await doJob(3, 5);
//     console.log('Hiep');
//     let finalResult = result1 + result2 + result3;
//     console.log(finalResult);
//     return finalResult;

// }
// async function SendFile() {
//     let task = doJob(1, 10);
//     // các hoạt động muốn làm song song với doJob thì phải code ở trên dòng await 
//     let result = await task; // đợi doJob hoàn thành xong mới đi tiếp

//     for (let index = 0; index < 10; index++) {
//         console.log('Number: ' + index);

//     }
//     console.log('Result: ' + result);
//     //tinh tong tu 1- 100

//     //
//     // show result 
// }
// SendFile();


// async function ParalleFlow() {
//     let result1 = doJob(1, 3)
//     let result2 = doJob(2, 4)
//     console.log('Hiep')
//     let result3 = doJob(3, 5)

//     let finalResult = await result1 + await result2 + await result3;

//     console.log(finalResult);
//     return finalResult;
// }
// async function ParalleFlow2() {
//     let result1 = doJob(1, 10);
//     let result2 = doJob(2, 4);
//     let result3 = doJob(3, 5);
//     console.log('hiep');
//     let r1 = await result1;

//     let r2 = await result2;
//     console.log('ABC');
//     let r3 = await result3;


//     console.log('R1: ' + r1);
//     console.log('R2: ' + r2);

//     let finalResult = r1 + r2 + r3;

//     console.log(finalResult);
//     return finalResult;
// }


//SerialFlow();
//ParalleFlow2();

// router.post('/upload-profile-pic', (req, res) => {
//     // 'profile_pic' is the name of our file input field in the HTML form
//     let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('myimage');
//     upload(req, res, function(err) {
//         // req.file contains information of uploaded file
//         // req.body contains information of text fields, if there were any

//         if (req.fileValidationError) {
//             return res.send(req.fileValidationError);
//         } else if (!req.file) {
//             return res.send('Please select an image to upload');
//         } else if (err instanceof multer.MulterError) {
//             return res.send(err);
//         } else if (err) {
//             return res.send(err);
//         }

//         // Display uploaded image for user validation
//         res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
//     });
// });

function creatPdfFromHTML(html) { // convert to pdf from html
    let path = process.cwd() + "/uploads/";
    // var html = fs.readFileSync(path + 'index.html', 'utf8');
    console.log(html);
    var options = { format: 'Letter' };
    pdf.create(html, options).toFile(path + 'mypdf2.pdf', function(err, res) {
        if (err) return console.log(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
    });
}

function pdfToHTML() {
    let path = process.cwd() + "/uploads/";
    // pdf2html.html(path + 'mypdf.pdf', (err, html) => {
    //     if (err) {
    //         console.error('Conversion error: ' + err)
    //     } else {
    //         creatPdfFromHTML(html);
    //     }
    // })

    reader.parseFileItems(path + 'mypdf.pdf', (err, item) => {
        if (err) {
            console.log(err);
        } else if (!item) {
            console.log('Item null');
        } else if (item.text) console.log(item.text);
    })
}

//pdfToHTML()


router.get('/pdfFromHTML', (req, res) => {
    let path = process.cwd() + "/uploads/";
    res.pdfFromHTML({
        filename: path + 'mypdf.pdf',
        html: path + 'index.html'
    });

})


function readFileHtml() {
    var path = process.cwd() + "/uploads/";
    fs.readFile(path + 'index.html', 'utf8', (err, data) => { // chi doc dc txt
        if (err) {
            throw err
        }
        console.log('---------');

        const isEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var x = new RegExp(isEmail)
        const isVNPhoneMobile = /((09|03|07|08|05)+([0-9]{8})\b)/g;
        console.log(x.test('mrhiep314@gmail.com'));
        console.log(isVNPhoneMobile.test('Phone: 0338546575'));
        // let result = data.replace(isEmail, 'DucHiep')
        // console.log(result)
        // fs.writeFile(path + 'index.html', result, 'utf8', function(err) {
        //     if (err) return console.log(err);
        // });
    })
}



//readFileHtml();




function zipFile() {
    let path = process.cwd() + "/uploads/";
    let content = "inner content of the file";
    let zip = new AdmZip();
    zip.addFile("test.txt", Buffer.alloc(content.length, content), "entry comment goes here");
    // add local file
    // get everything as a buffer
    var willSendthis = zip.toBuffer();
    // or write everything to disk
    zip.writeZip( /*target file name*/ path + "myzip.zip", (err) => {
        if (err) {
            console.log(err);
        }
    });
}


router.post('/hiep/zipfile', multer3.single("file"), (req, res) => {
    var buffer = req.file.buffer;
    var path = process.cwd() + "/uploads/";
    var content = "inner content of the file"

    console.log(x);
    var zip = new AdmZip();
    // zip.addFile("TA Tool workflow.docx.pdf", buffer, "entry comment goes here");
    // // add local file
    // // get everything as a buffer
    // var willSendthis = zip.toBuffer();
    // // or write everything to disk
    // zip.writeZip( /*target file name*/ path + "myzip.zip", (err) => {
    //     if (err) {
    //         console.log(err);
    //         return res.status(500).json();
    //     }
    //     return res.status(200).json();
    // });
    return res.status(200).json();
})



router.post('/duchiep/testreplacetext', async(req, res) => {


    var form = new formidable.IncomingForm({ multiples: false }); // đối tượng form chứa các thông tin submit từ form (gồm file và các parameter)

    //Emitted whenever a new file is detected in the upload stream
    form.on('fileBegin', function(formName, file) { //  // formName the name in the form (<input name="thisname" type="file">)
        if (!file.name.match(/\.(pdf)$/)) {
            console.log('Only pdf files are allowed!');
        }
    });


    form.parse(req, (err, fields, files) => {
        let fileOriginalName = files.file.name;
        // console.log(fileOriginalName);
        let filename = fileOriginalName.slice(0, fileOriginalName.length - 5);
        let oldpath = files.file.path;
        let newpath = './uploads/' + fileOriginalName; // filetoupload ten cua the file ben font end

        fs.rename(oldpath, newpath, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'rename file fail.' });
            }
            convertPDF.getInfoPdfFile(newpath).then((resolve) => {
                let p = resolve.pages;

                let listContent = convertPDF.getContent(p);
                const element = convertPDF.getCoordinatePhoneAndEmail(listContent)


                //console.log(element);
                const outputPath = process.cwd() + '/hideinfo/' + filename + '(fixed).pdf';

                replace(element, newpath, outputPath).then(() => {
                    return res.status(200).json({ filename: filename + '(fixed).pdf' })
                        // res.download(outputPath, filename + '(fixed).pdf', (err) => {
                        //     if (err) {
                        //         console.log('Error 525');
                        //         console.log(err);
                        //     }
                        //     console.log('Download success.');
                        // })
                }).catch(() => {
                    return res.status(500).json({ message: 'Error row 531' });
                });

            }).catch((reject) => {
                console.log('Error row 536');
                console.log(reject);
                return res.status(500).json({ messgae: 'Error row 536' });
            })
        });
    });
})

router.get('/files/:name', (req, res) => {
    let filename = req.params.name;
    res.download(process.cwd() + '/hideinfo/' + filename, (err) => {
        if (err) {
            console.log(err);
        }
    })
})



async function replace(element, inputPath, outputPath) {
    const convertToPDF = async() => {
        const pdfDoc = await PDFNet.PDFDoc.createFromFilePath(inputPath);
        await pdfDoc.initSecurityHandler();
        for (let index = 0; index < element.length; index++) {
            const replacer = await PDFNet.ContentReplacer.create(); // nếu ko tạo mới thì khi apply chỉnh sửa (call process) ở page mới thì nó vẫn áp dụng các rule của page cũ sang page mới 
            const e = element[index];
            const page = await pdfDoc.getPage(e.page);
            const pageHeight = await page.getPageHeight();
            await replacer.addText(new PDFNet.Rect(e.content.x, pageHeight - e.content.y, e.content.x + e.content.width, pageHeight - e.content.y + e.content.height), '*********')

            await replacer.process(page);
        }

        await pdfDoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
    }

    PDFNet.runWithoutCleanup(convertToPDF).then(() => {
        // fs.readFile(outputPath, (err, data) => {
        //     if (err) {
        //         console.log(err);
        //     }

        //     console.log('Ok');
        // })
        console.log('Ok');
    }).catch((err) => {
        console.log('Error row 573');
        console.log(err);
    })
}



var buildZipFile = (filePath) => {
    return new Promise((resolve, rejects) => {
        let countFile = 0;

        const zip = new StreamZip({
            file: filePath,
            storeEntries: true
        })

        zip.on('entry', (entry) => { // duyet het entry trong zip va pipe ra cai foler temp va co file xml 

            var pathname = path.resolve('./temp', entry.name);
            if (/\.\./.test(path.relative('./temp', pathname))) {
                console.warn("[zip warn]: ignoring maliciously crafted paths in zip file:", entry.name);
                rejects("[zip warn]: ignoring maliciously crafted paths in zip file:", entry.name);
            }

            if ('/' === entry.name[entry.name.length - 1]) {
                console.log('[DIR]', entry.name);
                rejects();;
            }
            // console.log('[FILE]', entry.name);
            zip.stream(entry.name, function(err, stream) {
                if (err) {
                    console.error('Error:', err.toString());
                    rejects('Error:', err.toString());
                }

                stream.on('error', function(err) {
                    console.log('[ERROR]', err);
                    rejects('[ERROR]', err);
                });

                // example: print contents to screen
                //stream.pipe(process.stdout);


                // example: save contents to file
                fs.mkdir(path.dirname(pathname), { recursive: true }, function(err) {
                    stream.pipe(fs.createWriteStream(pathname)).on('finish', () => {
                        countFile += 1;
                        if (countFile === zip.entriesCount) {
                            resolve('Ok');
                        }
                    });
                });
            });
        });
    })
}
var convertFile2 = (filename) => {
    return new Promise((resolve, rejects) => {
        filename = filename.slice(0, filename.length - 5);
        fs.readFile('./temp/word/document.xml', 'utf8', (err, data) => {
            if (err) rejects(err);

            var result = data.replace(isEmail, '***********').replace(isVNPhoneMobile, '***********')
            fs.writeFile('./temp/word/document.xml', result, (err) => {
                if (err) console.log(err);
                zipDirectory('./temp/', './uploads/' + filename + '(Fixed).docx').then(() => {
                    resolve('OK');
                }).catch((err) => {
                    rejects();
                });

            })
        });
    })
}

// function zipDirectory(inputDir, outputFile) {
//     let archive = archiver('zip');
//     archive.on('error', function(err) {
//         throw err;
//     })

//     let output = fs.createWriteStream(outputFile);
//     archive.pipe(output).on('finish', () => {

//     });
//     /* Ok, so we don't want a root name of <input_dir>, this is our workaround. */
//     archive.directory(inputDir, '../');
//     archive.finalize();
// }

function zipDirectory(source, out) {
    const archive = archiver('zip');
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false) // false => root
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}


router.get('/convert/pdftohtml', async(req, res) => {
    await convert('./uploads/Nguyen-Van-A-TopCV.vn-020321.132900.pdf', './uploads/Nguyen-Van-A-TopCV.vn-020321.132900.html')
    return res.status(200).json();
})

router.post('/upload/cv/html', (req, res) => {
    var form = new formidable.IncomingForm({ multiples: true }); // đối tượng form chứa các thông tin submit từ form (gồm file và các parameter)

    //Emitted whenever a new file is detected in the upload stream
    form.on('fileBegin', function(formName, file) { //  // formName the name in the form (<input name="thisname" type="file">)
        if (!file.name.match(/\.(html)$/)) {
            console.log('Only html, docx, pdf files are allowed!');
        }
    });
    form.on('end', () => {

    })

    form.parse(req, (err, fields, files) => {
        // let fileOriginalName = files.file.name;
        // console.log(fileOriginalName);
        console.log(files);
        // let filename = fileOriginalName.slice(0, fileOriginalName.length - 5);
        // let oldpath = files.file.path;
        // let newpath = './uploads/' + fileOriginalName; // filetoupload ten cua the file ben font end
        return res.status(200).json();
        // fs.rename(oldpath, newpath, function(err) {
        //     if (err) throw err;
        //     fs.readFile('./uploads/' + fileOriginalName, 'utf8', (err, data) => {
        //         if (err) {
        //             return res.status(500).json();
        //         }
        //         let result = data.replace(isEmail, '**********');
        //         fs.writeFile('./uploads/' + filename + '(Fixed).html', result, (err) => {
        //             if (err) {
        //                 return res.status(500).json();
        //             }
        //             return res.status(200).json();

        //         })
        //     })
        // });
    });



})

// console.log(isEmail.test('href="mailto:huyhoang8a5@gmail.com'));
// console.log('href="mailto:  huyhoang8a5@gmail.com'.replace(isEmail, '******'));

router.post('/upload/cv/docx', multer4.single('file'), (req, res) => {

    let buff = req.file.buffer;
    let filename = req.file.originalname;
    console.log(filename);
    let newFilename = req.file.originalname + '.zip';
    fs.writeFile('./uploads/' + filename, buff, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json();
        }
        fs.rename('./uploads/' + filename, './uploads/' + newFilename, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json();
            }
            buildZipFile('./uploads/' + newFilename).then((result) => {
                convertFile2(filename).then((result) => {
                    fs.rename('./uploads/' + newFilename, './uploads/' + filename, (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json();
                        }

                        return res.status(200).json();
                    })
                    fs.rmdirSync('./temp', { recursive: true });
                }).catch(() => {
                    return res.status(500).json();
                })
            }).catch((err) => {

                return res.status(500).json();
            })
        })
    })
})


// Returns a Multer instance that provides several methods for generating middleware that process files uploaded in multipart/form-data format
router.post("/upload", multer2.single("file"), (req, res) => { // xoa email vs phone => done
    // multer
    console.log("Upload Image");
    const file = req.file;
    const newFileName = `${file.originalname}`;
    const fileUpload = bucket.file("myimage/" + newFileName);
    const blobStream = fileUpload.createWriteStream({ //blobstream is a variable that contains the stream of the blob data of your file... blobstream "mount" or "transform" blob data in your file....
        metadata: {
            contentType: file.mimetype
        }
    })

    uploadImageFile(fileUpload, file)
        .then(() => {
            getUrlFilename(fileUpload)
                .then((success) => {
                    return res.status(200).json({ url: success });
                })
                .catch((error) => {
                    console.log(error);
                    return res.status(500).json({ messgae: "Get url filename error." });
                });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json({ messgae: "Server error." });
        });
});

router.delete("/file/:name", (req, res) => {
    let name = req.params.name;
    bucket
        .file("myimage/" + name)
        .delete()
        .then((success) => {
            console.log(success);
            return res.status(200).json();
        })
        .catch((error) => {
            return res.status(500).json();
        });
});

router.get("/file/:name", (req, res) => {
    var name = req.params.name;
    console.log(name);
    let x = bucket.file("myimage/" + name);
    x.download()
        .then((r) => {

            console.log(r[0]); // buffer
            return res.status(200).json();
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json();
        });

});

router.get("/download/file/:name", (req, res) => {
    var name = req.params.name;
    var downloadFolder = process.env.USERPROFILE + "/Downloads/";
    console.log(process.platform);
    console.log(downloadFolder);
    const localFilename = downloadFolder + name;
    var e = process.cwd() + "/uploads/";
    const options = {
        // The path to which the file should be downloaded, e.g. "./file.txt"
        destination: localFilename,
    };
    // bucket.file('myimage/' + name).createReadStream()
    //     .on('error', function(err) {
    //         console.log(err);
    //         return res.status(500).json();
    //     })
    //     .on('response', function(response) {
    //         // Server connected and responded with the specified status and headers.
    //     })
    //     .on('end', function() {
    //         return res.status(200).json();
    //         // The file is fully downloaded.
    //     })
    //     .pipe(fs.createWriteStream(localFilename));

    bucket
        .file("myimage/" + name)
        .download(options)
        .then(() => {
            console.log("Downloaded.");
            return res.status(200).json();
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json();
        });
});

const stringifiedParams = queryString.stringify({
    client_id: '157427782761704',
    redirect_uri: 'https://jobtestcom.herokuapp.com/users/authenticate/facebook/',
    // scope: ['email', 'user_friends'].join(','), // comma seperated string
    scope: 'email',
    response_type: 'code',
    auth_type: 'rerequest',
    display: 'popup'
})
const facebookLoginUrl = `https://www.facebook.com/v9.0/dialog/oauth?${stringifiedParams}`;
router.get('/authenticate/facebook/', async(req, res) => {
    var faceCode = req.query.code;
    const { data } = await axios({
        url: 'https://graph.facebook.com/v4.0/oauth/access_token',
        method: 'get',
        params: {
            client_id: '157427782761704',
            client_secret: '8a2be5676356ce755f6191ef6306b3b8',
            redirect_uri: 'https://jobtestcom.herokuapp.com/users/authenticate/facebook/',
            code: faceCode
        }
    });

    var token = data.access_token;
    var userData = await getFacebookUserData(token);
    // console.log(data); // { access_token, token_type, expires_in }
    return res.status(200).json({ userData })
})


async function getFacebookUserData(access_token) {
    const { data } = await axios({
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
            fields: ['id', 'email', 'first_name', 'last_name'].join(','),
            access_token: access_token,
        },
    });
    // console.log(data); // { id, email, first_name, last_name }
    return data;
};


router.get('/authenticate/google', async(req, res) => {
    console.log('Nguyen Duc Hiep')
    var googleCode = req.query.code;
    const data = await google_util.getGoogleAccountFromCode(googleCode);
    return res.status(200).json(data)
})

router.get('/login/facebook', (req, res) => {
    return res.status(200).json({ facebookLoginUrl })
})

router.get('/login/google', (req, res) => {
    var googleLoginUrl = google_util.urlGoogle()
    return res.status(200).json({ googleLoginUrl })
})

router.get("/download/firebase/:name", (req, res) => {
    // SSC102-CV-Coverletter-Nguyen Duc Hiep.pdf
    var name = req.params.name;
    var path = process.cwd() + "/uploads/";
    const options = {
        // The path to which the file should be downloaded, e.g. "./file.txt"
        destination: path + name,
    };
    bucket
        .file("myimage/" + name)
        .download(options)
        .then(() => {
            res.download(path + name, name, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    fs.unlinkSync(path + name);
                    console.log("Downloaded.");
                }
            });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json();
        });
});

router.post("/uploadmulti", multer2.array("files", 10), (req, res) => {
    // multer
    console.log("Upload Image");
    let files = req.files;
    let listUrl = [];
    var x;
    for (x = 0; x < files.length; x++) {
        let file = files[x];
        let newFileName = `${file.originalname}`;
        let fileUpload = bucket.file("myimage/" + newFileName);
        uploadImageFile(fileUpload, file)
            .then(() => {
                getUrlFilename(fileUpload)
                    .then((success) => {
                        listUrl.push(success);
                        if (listUrl.length == files.length) {
                            return res.status(200).json({ listUrl });
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        return res.status(500).json({ messgae: "Get url filename error." });
                    });
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ messgae: "Server error." });
            });
    }
});

router.post("/files", multer3.single("file"), (req, res) => {
    var buffer = req.file.buffer;
    if (req.file.mimetype == "application/pdf") {

        pdfparse(buffer)
            .then(function(data) {
                console.log(data.numpages);
                console.log("----------------");
                console.log(data.text);
                var content = data.text;
                if (content.includes("C#")) {
                    console.log("true");
                }
                return res.status(200).json();
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json();
            });
    } else {
        textract.fromBufferWithMime(
            req.file.mimetype,
            buffer,
            function(error, text) {
                // doc dc word vs txt, html
                if (error) {
                    console.log(error);
                    return res.status(500).json();
                } else {
                    if (text.includes("C#")) {
                        console.log("true");
                    }
                    return res.status(200).json();
                }
            }
        );
    }
});


// format promise function
// var x = () => {
//     return new Promise((resolve, reject) => {

//     })
// }

var getUrlFilename = function(fileUpload) {
    return new Promise((resolve, reject) => {
        fileUpload
            .getSignedUrl({
                action: "read",
                expires: "03-06-2491",
            })
            .then((signedUrls) => {
                resolve(signedUrls[0]);
            })
            .catch((error) => {
                reject("Something wrong.");
            });
    });
};
var uploadImageFile = function(fileUpload, file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject("No image file");
        }

        const blobStream = fileUpload.createWriteStream({
            //blobstream is a variable that contains the stream of the blob data of your file... blobstream "mount" or "transform" blob data in your file....
            metadata: {
                contentType: file.mimetype,
            },
        });
        blobStream.on("error", (error) => {
            console.log(error);
            reject("Something is wrong! Unable to upload at the moment.");
        });
        blobStream.on("finish", () => {
            resolve();
        });

        blobStream.end(file.buffer);
    });
};
// Create new user
router.post("/", (req, res) => {
    var newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        status: 1,
    };
    User.find({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Server error." });
        } else if (user) {
            return res.status(200).json({ message: "The email has been used." });
        }
        User.create(newUser, (err, user) => {
            if (err) {
                return res.status(500).json({
                    message: "There was a problem adding the information to the database.",
                });
            }
            res.status(200).json(user);
        });
    });
});

// get all user
router.get("/", verifyToken, (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }
        res.status(200).json(users);
    });
});

//Get single user by id
router.get("/:id", verifyToken, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Server error." });
        } else if (!user) {
            return res.status(200).json({ message: "No user found." });
        }
        res.status(200).json(user);
    });
});

// remove user by update status
router.delete("/:id", (req, res) => {
    User.findByIdAndUpdate(
        req.params.id, { $set: { status: 0 } },
        (err, user) => {
            if (err) {
                return res.status(500).json({ message: "Server error." });
            } else if (!user) {
                return res.status(200).json({ message: "No found user to delete." });
            }
            res.status(200).json({ message: "Delete success!" });
        }
    );
});

// update user
router.put("/:id", (req, res) => {
    User.findByIdAndUpdate(
        req.params.id,
        req.body, { new: true },
        (err, user) => {
            if (err) {
                return res.status(500).json({ messgae: "Server error." });
            } else if (!user) {
                return res.status(200).json({ message: "No found user to update." });
            }
            res.status(200).json(user);
        }
    );
});

router.post("/login", (req, res) => {
    // User.find => neeus ko co se tra ve mot array rong~
    User.findOne({ email: req.body.email, password: req.body.password, status: 1 }, { email: 1, name: 1 },
        (err, user) => {
            if (err) {
                return res.status(500).json({ message: "Server error. " + err });
            } else if (!user) {
                return res
                    .status(200)
                    .json({ messgae: "Email or password maybe incorrect." });
            }
            jwt.sign({ name: user.name },
                sercretKey, { expiresIn: "1h" },
                (err, token) => {
                    if (err) {
                        return res.status(500).json({ messgae: "Server error." });
                    }
                    res.status(200).json({ token });
                }
            );
        }
    );
});
// expiresIn: "10h" // it will be expired after 10 hours
// expiresIn: "20d" // it will be expired after 20 days
// expiresIn: 120 // it will be expired after 120ms
// expiresIn: "120s" // it will be expired after 120s
// var privateKey = fs.readFileSync('private.key');
// var token = jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256'});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        jwt.verify(bearerToken, sercretKey, (err, authData) => {
            if (err) {
                res.status(401).send("Unauthorized");
            } else {
                // var c = jwt.decode(bearerToken); // { name: 'Nguyen Duc Hiep', iat: 1612684313, exp: 1612684343 }
                // console.log(c);
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
}
// muon doc du lieu trong token => https://www.npmjs.com/package/jwt-decode

module.exports = router;
module.exports = router;