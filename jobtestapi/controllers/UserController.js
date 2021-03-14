const express = require('express')
const router = express.Router()
const User = require('../models/User')
const sercretKey = 'nguyenduchiepnguyenduchiep'
const fs = require('fs')
const helpers = require('../helper');
const serviceAccount = require("../path/feedbacksystem-282204-firebase-adminsdk-mqdb0-7daeea3c24.json");
const https = require('https')
const { PDFNet } = require('@pdftron/pdfnet-node')
const formidable = require('formidable');
const convertPDF = require('../util/convertPdf')

const isVNPhoneMobile = /((09|03|07|08|05)+([0-9]{8})\b)/g;
const isEmail = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;









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
        fs.copyFile(oldpath, newpath, (err) => {
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
            fs.unlink(oldpath, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json();
                }
            })
        })

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


module.exports = router;
module.exports = router;