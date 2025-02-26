const express = require('express');
const { 
    membershipForm, 
    upcomingEvents, 
    getEvent, 
    banner, 
    allEvents, 
    getGallery, 
    recentNews, 
    allNews, 
    getNews, 
    pastEvents,
    getExhibitorsPage,
    getExhibitors
} = require('../controllers/userController');
const { fileDownload, getMembershipPDF } = require('../controllers/fileController');
const router = express.Router();

router.get('/',(req,res)=>{
    res.send(`SIATI-SERVER`)
})

router.post('/addmembership',membershipForm);
router.get('/upcomingevents',upcomingEvents);
router.get('/allevents',allEvents);
router.get('/event/:eventId',getEvent);
router.get('/banner',banner);
router.get('/gallery/:page/:limit',getGallery);
router.get('/recentnews',recentNews);
router.get('/news/:page',allNews);
router.get('/newsdetail/:newsId',getNews);
router.get('/pastevents/:page',pastEvents);

router.get('/download/:id', fileDownload);
router.get('/membershipDoc',getMembershipPDF);

router.get('/exhibitorpage',getExhibitorsPage);
router.get('/exhibitors',getExhibitors);



module.exports=router;