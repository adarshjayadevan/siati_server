const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoURI = process.env.MONGO_URL;
const moment = require('moment');

let gfsBucket;

mongoose.connect(mongoURI, {
}).then(() => {
    console.log('Connected to MongoDB-GridFS');
    const conn = mongoose.connection;
    gfsBucket = new GridFSBucket(conn.db, { bucketName: 'files' });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});


const fileUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: {
            filename: req.file.originalname,
            name: req.body.filename,
            detail: req.body.detail,
            type: 'document',
        }
    });


    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', () => {
        res.status(201).json({ file: { id: uploadStream.id, filename: req.file.originalname } });
    });

    uploadStream.on('error', (err) => {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Error uploading file' });
    });
}

const fileDownload = async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const downloadStream = gfsBucket.openDownloadStream(fileId);


        downloadStream.on('file', (file) => {
            res.set({
                'Content-Type': file.contentType,
                'Content-Disposition': `${file.filename}`,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Expose-Headers': 'Content-Disposition'
            });
        });

        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error('Download error:', err);
            res.status(404).json({ message: 'File Not Found' });
        });

        downloadStream.on('end', () => {
            res.end();
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ message: 'Error fetching file' });
    }
}

const fileDelete = async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        await gfsBucket.delete(fileId).then(respo => {
            return res.status(200).json({ message: 'file deleted' })
        }).catch(err => {
            console.log(err)
            if (err.message == `File not found for id ${req.params.id}`) {
                return res.status(400).json({ message: 'file not found' })
            }
            return res.status(400).json({ message: err.message })
        })
        // res.status(200).json({message:'file deleted'})
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ message: 'Error fetching file' });
    }
}

const fileRename = async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        await gfsBucket.rename(fileId, req.body.name);
        res.status(200).json({ message: 'file name updated' })
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ message: 'Error fetching file' });
    }
}

const getMembershipPDF = async (req, res) => {
    try {
        const files = await gfsBucket.find({});
        for await (const doc of files) {
            // console.log(doc);
            if (doc.metadata.name == 'membership_form') {
                return res.status(200).json({ data: doc });
            }
        }
        return res.status(400).json({ message: `document not found` });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getAllDocuments = async (req, res) => {
    try {

        const pageNum = parseInt(req.query.pageNum) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const skip = (pageNum - 1) * perPage;

        const totalFiles = await gfsBucket.find({ "metadata.type": "document" }).toArray();
        const totalPages = Math.ceil(totalFiles.length / perPage);

        let files = await gfsBucket.find({ "metadata.type": "document" })
            .skip(skip)
            .limit(perPage)
            .toArray();

        files = files.map(file => {
            return {
                ...file,
                uploadDate: moment(file.uploadDate).format('ll')
            };
        });

        res.status(200).json({
            data: files,
            pagination: {
                totalFiles: totalFiles.length,
                totalPages,
                currentPage: pageNum,
                perPage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


const uploadExhibitorFile = async (file, filedata) => {
    return new Promise((resolve, reject) => {
        try {
            const uploadStream = gfsBucket.openUploadStream(file.originalname, {
                contentType: file.mimetype,
                metadata: {
                    filename: file.originalname,
                    name: filedata.filename,
                    detail: filedata.detail,
                    type: 'exhibitor'
                }
            });

            uploadStream.end(file.buffer);

            uploadStream.on('finish', () => {
                resolve({ status: true, file: { id: uploadStream.id, filename: file.originalname } });
            });

            uploadStream.on('error', (err) => {
                reject({ status: false, message: `${err}` });
            });
        } catch (error) {
            reject({ status: false, message: error.message });
        }
    });
};

const deleteFile = async (id) => {
    let result = {
        status : false,
        message: 'unable to delete file'
    }
    const fileId = new mongoose.Types.ObjectId(id);
    await gfsBucket.delete(fileId).then(respo => {
        result["status"] = true;
        result["message"] = 'file deleted';
        return result;
    }).catch(err => {
        console.log(err)
        if (err.message == `File not found for id ${id}`) {
            result["message"] = `File not found for id ${id}`;
            return result;
        }
        return result;
    })
}

module.exports = {
    fileUpload,
    fileDownload,
    fileDelete,
    fileRename,
    getMembershipPDF,
    getAllDocuments,
    uploadExhibitorFile,
    deleteFile
}