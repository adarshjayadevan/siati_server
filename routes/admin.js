const express = require('express');
const path = require('path');
require('dotenv').config({path:path.join(__dirname,'..','.env')});
const { 
    addEvent, 
    changeBanner, 
    register, 
    login, 
    allEvents, 
    getEvent, 
    updateEvent, 
    deleteEvent, 
    addGalleryEvent, 
    allGalleryEvents, 
    updateGalleryEvent, 
    getGalleryEvent, 
    deleteGalleryEvent, 
    addNews, 
    allNews,
    addMember,
    updateMember,
    addExhibitor,
    viewAllExhibitors,
    listEvents,
    deleteExhibitor,
    toggleExhibitor,
    getExhibitor
} = require('../controllers/adminController');
const { imageUpload, documentUpload } = require('../config/multer');
const { verifyAdmin } = require('../utils/verifyToken');
const { fileUpload, fileDelete, fileRename, getAllDocuments } = require('../controllers/fileController');

const router = express.Router();

router.post('/event',verifyAdmin,(req,res,next)=>{
    imageUpload.single('image')(req,res,(err)=>{
        if(err){
            if (err.message === "Unsupported file type. Only .jpg, .jpeg, and .png files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
},addEvent);

router.post('/changebanner',verifyAdmin,(req,res,next)=>{
    imageUpload.single('image')(req,res,(err)=>{
        if(err){
            if (err.message === "Unsupported file type. Only .jpg, .jpeg, and .png files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
},changeBanner);

router.post(`/register`,register);

router.post(`/login`,login);

router.get('/events',verifyAdmin,allEvents);

router.get('/event/:eventId',verifyAdmin,getEvent);

router.put('/event/:id',verifyAdmin,(req,res,next)=>{
    imageUpload.single('image')(req,res,(err)=>{
        if(err){
            if (err.message === "Unsupported file type. Only .jpg, .jpeg, and .png files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
},updateEvent);

router.delete('/event/:eventId',verifyAdmin,deleteEvent);

router.post('/galleryevent',verifyAdmin,(req,res,next)=>{
    imageUpload.single('image')(req,res,(err)=>{
        if(err){
            if (err.message === "Unsupported file type. Only .jpg, .jpeg, and .png files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
},addGalleryEvent);

router.get('/gallery',verifyAdmin,allGalleryEvents);

router.put('/gallery/:id',verifyAdmin,(req,res,next)=>{
    imageUpload.single('image')(req,res,(err)=>{
        if(err){
            if (err.message === "Unsupported file type. Only .jpg, .jpeg, and .png files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
},updateGalleryEvent);

router.get('/gallery/:eventId',verifyAdmin,getGalleryEvent);

router.delete('/gallery/:eventId',verifyAdmin,deleteGalleryEvent);

router.post('/news',verifyAdmin,(req,res,next)=>{
    imageUpload.single('image')(req,res,(err)=>{
        if(err){
            if (err.message === "Unsupported file type. Only .jpg, .jpeg, and .png files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
},addNews);

router.post('/upload', verifyAdmin, (req,res,next)=>{
    documentUpload.single('file')(req,res,(err)=>{
        if(err){
            if (err.message == "File type is not supported. Only .pdf, .doc, .docx, and .xlsx files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
}, fileUpload);

router.get('/news',verifyAdmin,allNews);

router.delete('/file/:id', verifyAdmin, fileDelete);

router.put('/file/:id', verifyAdmin, fileRename);

router.get('/documents',verifyAdmin,getAllDocuments);

router.post('/member', verifyAdmin, (req,res,next)=>{
    documentUpload.single('file')(req,res,(err)=>{
        if(err){
            if (err.message == "File type is not supported. Only .pdf, .doc, .docx, and .xlsx files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
}, addMember);

router.put('/member/:id', verifyAdmin, (req,res,next)=>{
    documentUpload.single('file')(req,res,(err)=>{
        if(err){
            if (err.message == "File type is not supported. Only .pdf, .doc, .docx, and .xlsx files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
}, updateMember);

router.post('/exhibitor', verifyAdmin, (req,res,next)=>{
    imageUpload.array('image')(req,res,(err)=>{
        if(err){
            if (err.message === "Unsupported file type. Only .jpg, .jpeg, and .png files are allowed.") {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: 'An error occured during file upload' });
        }
        next();
    })
}, addExhibitor);

router.get('/exhibitors',verifyAdmin, viewAllExhibitors);

router.get('/listevents',verifyAdmin, listEvents);

router.delete('/exhibitor/:exhibitorId',verifyAdmin, deleteExhibitor);

router.patch('/exhibitor/:exhibitorId',verifyAdmin, toggleExhibitor);

router.get('/exhibitor/:exhibitorId',verifyAdmin, getExhibitor);

module.exports=router;