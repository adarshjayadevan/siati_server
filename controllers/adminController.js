const Event = require('../schemas/events');
const Banner = require('../schemas/banner');
const Admin = require('../schemas/admin');
const Gallery = require('../schemas/gallery');
const Member = require('../schemas/members');
const News = require('../schemas/news');
const Exhibitor = require('../schemas/exhibitors');
const { fileToBase64 } = require('../utils/fileConverter');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { uploadExhibitorFile, deleteFile } = require('./fileController');



const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Admin.findOne({ username });
        if (user) return res.status(400).json({ message: `user already exist` });
        const newUser = new Admin({
            username,
            password
        })
        await newUser.save();
        res.status(201).json({ message: `admin added` })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Admin.findOne({ username });
        if (!user) return res.status(400).json({ message: `user does not exist` });
        if (user.password != password) return res.status(400).json({ message: `password incorrect` });
        const token = jwt.sign({ id: user._id, name: user.username, admin: true }, process.env.JWT_SECRET, { expiresIn: "10h" });
        res.status(202).json({ message: 'login successful', token })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


const addEvent = async (req, res) => {
    try {
        const { event, startDate, endDate, description, location, eventShort } = req.body;
        if (!event 
            // || !startDate 
            // || !endDate 
            // || !description 
            // || !location
        ) {
            return res.status(400).json({ message: `Enter required Fields` })
        }
        // const fileString = fileToBase64(req.file);
        let fileString = '';
        if(req.file){
            fileString = fileToBase64(req.file);
        }
        const eventId = req.body.event.toLowerCase().replace(/\s+/g, '_');
        const eventExist = await Event.findOne({ eventId });
        if (eventExist) return res.status(400).json({ message: `event already added` });
        function parseDate(dateString) {
            const [day, month, year] = dateString.split('-');
            return new Date(year, month - 1, day);
        }
        const newEvent = new Event({
            event: req.body.event,
            eventId,
            startDate: parseDate(req.body.startDate),
            endDate: parseDate(req.body.endDate),
            description: description?description:'',
            location: location?location:'Venue to be decided',
            eventShort: eventShort ? eventShort : '',
            image: fileString
        })
        await newEvent.save();
        res.status(201).json({ message: `Event Added` })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateEvent = async (req, res) => {
    try {
        const { event, startDate, endDate, description, location, eventShort } = req.body;
        if (!req.params.id) {
            return res.status(400).json({ message: `Enter required Fields` })
        }
        let fileString;
        if (req.file) {
            fileString = fileToBase64(req.file);
        }
        const eventExist = await Event.findById(req.params.id)
        const eventId = req.body.event?.toLowerCase().replace(/\s+/g, '_');
        if (!eventExist) return res.status(400).json({ message: `event does not exist` });
        function parseDate(dateString) {
            const [day, month, year] = dateString.split('-');
            return new Date(year, month - 1, day);
        }
        const updatedEvent = await Event.updateOne({ _id: req.params.id }, {
            $set: {
                event: req.body.event ? req.body.event : eventExist.event,
                eventId: eventId ? eventId : eventExist.eventId,
                startDate: req.body.startDate ? parseDate(req.body.startDate) : eventExist.startDate,
                endDate: req.body.endDate ? parseDate(req.body.endDate) : eventExist.endDate,
                description: req.body.description ? req.body.description : eventExist.description,
                location: req.body.location ? req.body.location : eventExist.location,
                eventShort: req.body.eventShort ? req.body.eventShort : eventExist.eventShort,
                image: req.file ? fileString : eventExist.image
            }
        }, { new: true })
        res.status(201).json({ message: `Event Updated`, data: updatedEvent })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        let event = await Event.updateOne({_id:eventId},{
            $set:{
                isActive:false
            }
        }).lean();
        res.status(200).json({ message: `event deleted` });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const changeBanner = async (req, res) => {
    try {
        const { title, text } = req.body;
        if (!title || !text) {
            return res.status(400).json({ message: `Enter required Fields` })
        }
        const fileString = fileToBase64(req.file);
        await Banner.deleteMany({});
        const newBanner = new Banner({
            title,
            text,
            image: fileString
        })
        await newBanner.save();
        res.status(201).json({ message: `Banner Updated` })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const allEvents = async (req, res) => {
    try {
        const pageNum = parseInt(req.query.pageNum) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const skip = (pageNum - 1) * perPage;

        // const totalEvents = await Event.countDocuments();
        const totalEvents = (await Event.find({isActive:true})).length;
        const totalPages = Math.ceil(totalEvents / perPage);

        let events = await Event.find({ isActive: true })
            .skip(skip)
            .limit(perPage)
            .lean();

        events = events.map(elem => {
            const startDate = moment(elem.startDate);
            const endDate = moment(elem.endDate);
            const duration = endDate.diff(startDate, 'days') + 1;

            return {
                ...elem,
                startDate: startDate.format('ll'),
                endDate: endDate.format('ll'),
                date: `${startDate.format('ll')} - ${endDate.format('ll')}`,
                duration: `${duration} ${duration > 1 ? 'days' : 'day'}`
            };
        });

        res.status(200).json({
            data: events,
            pagination: {
                totalEvents,
                totalPages,
                currentPage: pageNum,
                perPage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        let event = await Event.findById(eventId).lean();
        res.status(200).json({ data: event });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const addGalleryEvent = async (req, res) => {
    try {
        const { title, date, description } = req.body;
        if (!title || !date ) {
            return res.status(400).json({ message: `Enter required Fields` })
        }
        const fileString = fileToBase64(req.file);
        function parseDate(dateString) {
            const [day, month, year] = dateString.split('-');
            return new Date(year, month - 1, day);
        }
        const newEvent = new Gallery({
            title,
            date: parseDate(req.body.date),
            description,
            image: fileString
        })
        await newEvent.save();
        res.status(201).json({ message: `Gallery Event Added` })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const allGalleryEvents = async (req, res) => {
    try {
        const pageNum = parseInt(req.query.pageNum) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const skip = (pageNum - 1) * perPage;

        // const totalEvents = await Gallery.find({isActive:true}).length;
        const totalEvents = (await Gallery.find({isActive:true})).length;
        const totalPages = Math.ceil(totalEvents / perPage);

        let events = await Gallery.find({ isActive: true })
            .skip(skip)
            .limit(perPage)
            .lean();

        events = events.map(elem => {
            const date = moment(elem.date);
            return {
                ...elem,
                date: date.format('ll')
            };
        });

        res.status(200).json({
            data: events,
            pagination: {
                totalEvents,
                totalPages,
                currentPage: pageNum,
                perPage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateGalleryEvent = async (req, res) => {
    try {
        const { title, date, description} = req.body;
        if (!req.params.id) {
            return res.status(400).json({ message: `Enter required Fields` })
        }
        let fileString;
        if (req.file) {
            fileString = fileToBase64(req.file);
        }
        const eventExist = await Gallery.findById(req.params.id)
        if (!eventExist) return res.status(400).json({ message: `gallery event does not exist` });
        function parseDate(dateString) {
            const [day, month, year] = dateString.split('-');
            return new Date(year, month - 1, day);
        }
        const updatedEvent = await Gallery.updateOne({ _id: req.params.id }, {
            $set: {
                event: req.body.title ? req.body.title : eventExist.title,
                date: req.body.date ? parseDate(req.body.date) : eventExist.date,
                description: req.body.description ? req.body.description : eventExist.description,
                image: req.file ? fileString : eventExist.image
            }
        }, { new: true })
        res.status(201).json({ message: `Gallery Event Updated`, data: updatedEvent })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getGalleryEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        let event = await Gallery.findById(eventId).lean();
        res.status(200).json({ data: event });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteGalleryEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        let event = await Gallery.updateOne({_id:eventId},{
            $set:{
                isActive:false
            }
        }).lean();
        res.status(200).json({ message: `gallery event deleted` });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const addNews = async (req, res) => {
    try {
        const { title, date, description, location } = req.body;
        if (!title || !date ) {
            return res.status(400).json({ message: `Enter required Fields` })
        }
        const newsId = title.toLowerCase().replace(/\s+/g, '_');
        const eventExist = await News.findOne({ newsId });
        if (eventExist) return res.status(400).json({ message: `news already added` });
        const fileString = fileToBase64(req.file);        
        function parseDate(dateString) {
            const [day, month, year] = dateString.split('-');
            return new Date(year, month - 1, day);
        }
        const newEvent = new News({
            title,
            date: parseDate(req.body.date),
            newsId,
            location,
            description,
            image: fileString
        })
        await newEvent.save();
        res.status(201).json({ message: `News Added` })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateNews = async (req, res) => {
    try {
        const { title, date, description, location } = req.body;
        if (!req.params.id) {
            return res.status(400).json({ message: `Enter required Fields` })
        }
        let fileString;
        if (req.file) {
            fileString = fileToBase64(req.file);
        }
        const newsExist = await News.findById(req.params.id)
        const newsId = req.body.title?.toLowerCase().replace(/\s+/g, '_');
        if (!newsExist) return res.status(400).json({ message: `news does not exist` });
        function parseDate(dateString) {
            const [day, month, year] = dateString.split('-');
            return new Date(year, month - 1, day);
        }
        const updatedEvent = await News.updateOne({ _id: req.params.id }, {
            $set: {
                title: req.body.title ? req.body.title : newsExist.title,
                newsId: newsId ? newsId : newsExist.newsId,
                location: location ? location : newsExist.location,
                date: req.body.date ? parseDate(req.body.date) : newsExist.date,
                description: req.body.description ? req.body.description : newsExist.description,
                image: req.file ? fileString : newsExist.image
            }
        }, { new: true })
        res.status(201).json({ message: `News Updated`, data: updatedEvent })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteNews = async (req, res) => {
    try {
        const { eventId } = req.params;
        let event = await News.updateOne({_id:eventId},{
            $set:{
                isActive:false
            }
        }).lean();
        res.status(200).json({ message: `event deleted` });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const allNews = async (req, res) => {
    try {
        const pageNum = parseInt(req.query.pageNum) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const skip = (pageNum - 1) * perPage;

        const totalEvents = (await News.find({isActive:true})).length;
        const totalPages = Math.ceil(totalEvents / perPage);

        let events = await News.find({ isActive: true })
            .skip(skip)
            .limit(perPage)
            .lean();

        events = events.map(elem => {
            const date = moment(elem.date);

            return {
                ...elem,
                date: date.format('ll'),
            };
        });

        res.status(200).json({
            data: events,
            pagination: {
                totalEvents,
                totalPages,
                currentPage: pageNum,
                perPage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getNews = async (req, res) => {
    try {
        const { newsId } = req.params;
        let _news = await News.findById(newsId).lean();
        res.status(200).json({ data: _news });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const addMember = async (req, res) => {
    try {
        let { exhibitor, detail, logo, url, event, exhibitorType } = req.body;
        let fileId = '';
        let isFile = false;
        // logo will be sent as base64 from frontend
        if(!exhibitor||!logo||!event||!exhibitorType){
            return res.status(400).json({message:'Give exhibitor, its logo, associated event and exhibitor type'})
        }
        if(!url&&!req.file){
            return res.status(400).json({message:'Give either a url or a file for exhibitor'})
        }

        if(req.file){
            const fileRespo  = await uploadExhibitorFile(req.file,{
                filename:exhibitor,
                detail:detail
            })
            fileId = fileRespo["file"]?.id?.toString();
            isFile = true;
        }
        const newExhibitor = new Member({
            exhibitor,
            logo,
            isFile,
            event,
            exhibitorType,
            fileId,
            url:url?url:''
        })
        await newExhibitor.save();
        res.status(200).json({ data: newExhibitor });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { exhibitor, detail, logo, url, event, exhibitorType } = req.body;
        let updatedFields = {};

        if (!id) {
            return res.status(400).json({ message: 'Member ID is required.' });
        }

        const existingExhibitor = await Member.findById(id);
        if (!existingExhibitor) {
            return res.status(404).json({ message: 'Member not found.' });
        }

        if (exhibitor) {
            updatedFields.exhibitor = exhibitor;
        }

        if (event) {
            updatedFields.event = event;
        }

        if (exhibitorType) {
            updatedFields.exhibitorType = exhibitorType;
        }

        if (logo) {
            updatedFields.logo = logo;
        }

        if (url) {
            updatedFields.url = url;
            updatedFields.isFile = false;
        }

        if (req.file) {
            if (existingExhibitor.fileId) {
                await deleteFile(existingExhibitor.fileId);
            }
            const fileRespo = await uploadExhibitorFile(req.file, {
                filename: exhibitor || existingExhibitor.exhibitor,
                detail: detail || existingExhibitor.detail
            });

            updatedFields.fileId = fileRespo["file"].id.toString();
            updatedFields.isFile = true;
        }

        const updatedExhibitor = await Member.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true } 
        );

        res.status(200).json({ data: updatedExhibitor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addExhibitor = async(req,res) => {
    try {
        const imageArr = req.files.map(file => ({ image: fileToBase64(file) }));
        const newExhibitor = new Exhibitor({
            exhibitor:req.body.exhibitor,
            exhibitorType:req.body.exhibitorType,
            event:req.body.event,
            images:imageArr
        })
        await newExhibitor.save();
        res.status(200).json({ data: newExhibitor });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

const updateExhibitor = async (req, res) => {
    try {
      const { exhibitor, exhibitorType, event, removedImages } = req.body;
      const newImages = req.files.map((file) => ({ image: fileToBase64(file) }));
  
      const exhibitorDoc = await Exhibitor.findById(req.params.id);
  
      // Remove specified images
      if (removedImages) {
        exhibitorDoc.images = exhibitorDoc.images.filter(
          (img) => !removedImages.includes(img.image)
        );
      }
  
      // Add new images
      exhibitorDoc.images.push(...newImages);
  
      // Update other fields
      exhibitorDoc.exhibitor = exhibitor;
      exhibitorDoc.exhibitorType = exhibitorType;
      exhibitorDoc.event = event;
  
      await exhibitorDoc.save();
  
      res.status(200).json({ data: exhibitorDoc });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

const viewAllExhibitors = async(req,res) => {
    try {
        // const exibitors = await Exhibitor.aggregate([
        //     {
        //         '$match':{
        //             'isActive':true
        //         }
        //     }
        // ])
        const exibitors = await Exhibitor.find().lean();
        res.status(200).json({ data: exibitors });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

const listEvents = async (req, res) => {
    try {

        let events = await Event.find({ isActive: true ,startDate:{$gte:new Date()} })
            .lean();

        events = events.map(elem => {
            const startDate = moment(elem.startDate);
            const endDate = moment(elem.endDate);
            const duration = endDate.diff(startDate, 'days') + 1;

            return {
                ...elem,
                startDate: startDate.format('ll'),
                endDate: endDate.format('ll'),
                date: `${startDate.format('ll')} - ${endDate.format('ll')}`,
                duration: `${duration} ${duration > 1 ? 'days' : 'day'}`
            };
        });

        res.status(200).json({
            data: events
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteExhibitor = async(req,res) => {
    try {
        const { exhibitorId } = req.params;
        const exhibitor = await Exhibitor.deleteOne({_id:exhibitorId});
        res.status(200).json({ message: `exhibitor deleted` });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const toggleExhibitor = async(req,res) => {
    try {
        const { exhibitorId } = req.params;
        const updatedExhibitor = await Exhibitor.findOneAndUpdate({ _id: exhibitorId }, [{ $set: { isActive: { $eq: [false, "$isActive"] } } }]);
        res.status(200).json({ message: `exhibitor toggled` });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getExhibitor = async(req,res) => {
    try {
        const { exhibitorId } = req.params;
        const exhibitorDetails = await Exhibitor.findById(exhibitorId).lean();
        res.status(200).json({ data: exhibitorDetails });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


module.exports = {
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
    updateNews,
    deleteNews,
    allNews,
    getNews,
    addMember,
    updateMember,
    addExhibitor,
    viewAllExhibitors,
    listEvents,
    deleteExhibitor,
    toggleExhibitor,
    updateExhibitor,
    getExhibitor
}