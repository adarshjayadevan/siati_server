const Membership = require('../schemas/membership');
const Event = require('../schemas/events');
const Banner = require('../schemas/banner');
const moment = require('moment');
const Gallery = require('../schemas/gallery');
const News = require('../schemas/news');
const Member = require('../schemas/members');
const Exhibitor = require('../schemas/exhibitors');

const membershipForm = async (req, res) => {
  try {
    // console.log(req.body);
    // const obj = {
    //   "name": "hal",
    //   "address": "hal sef  sgf dsg dsf",
    //   "contact": "e3w43",
    //   "correspondence": "dfdsf esf es",
    //   "city": "efdsfd",
    //   "state": "dsfdsf",
    //   "pincode": " efeasfse esf sef",
    //   "fax": "sdfsfds ",
    //   "website": "dsf sdf",
    //   "email": "adash.j@ikomet.com",
    //   "profile": "",
    //   "products": "",
    //   "membershipTeam": [
    //     { "name": "sfd s", "designation": "sf sa", "email": " fas" },
    //     { "name": "sfs", "designation": " aesf ", "email": "sdf " }
    //   ],
    //   "type": "proprietorship",
    //   "details": "sd fdsf sef",
    //   "turnover": [
    //     { "year": "2023", "turnover": "345" },
    //     { "year": "2022", "turnover": "345" },
    //     { "year": "2021", "turnover": "435" }
    //   ]
    // }
    const formData = {
      companyName: req.body.name,
      address: req.body.address,
      contact: req.body.contact,
      correspondenceAddress: req.body.correspondence,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      fax: req.body.fax,
      website: req.body.website,
      email: req.body.email,
      profile: req.body.profile,
      products: req.body.products,
      previousThreeTurnover: req.body.turnover,
      companyType: { type: req.body.type, details: req.body.details },
      managementTeam: req.body.membershipTeam
    }
    const newMembership = new Membership(formData);
    await newMembership.save();
    res.status(201).json({ message: `membership added` });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const upcomingEvents = async (req, res) => {
  try {
    // let events = await Event.find().limit(4).lean();
    let events = await Event.aggregate([
      // {
      //   $match: {
      //     startDate: { $gte: new Date() }
      //   }
      // },
      {
        $match: {
          isActive: true
        }
      },
      // {
      //   $sort: { createdAt: -1 }
      // },
      {
        $limit: 3
      }
    ])
    events = events.map(elem => ({
      ...elem,
      startDate: moment(elem.startDate).format('ll'),
      endDate: moment(elem.endDate).format('ll'),
    }));
    events = events.map(elem => ({
      ...elem,
      date: `${elem.startDate} - ${elem.endDate}`,
    }));

    res.status(200).json({ data: events });
    // res.status(200).json({ data: [] });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    let event = await Event.findOne({ eventId }).lean();
    event["date"] = `${moment(event.startDate).format('ll')} - ${moment(event.endDate).format('ll')}`
    res.status(200).json({ data: event });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const allEvents = async (req, res) => {
  try {
    let events = await Event.find().limit(6).lean();
    events = events.map(elem => ({
      ...elem,
      startDate: moment(elem.startDate).format('ll'),
      endDate: moment(elem.endDate).format('ll'),
    }));
    events = events.map(elem => ({
      ...elem,
      date: `${elem.startDate} - ${elem.endDate}`,
    }));
    res.status(200).json({ data: events });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const banner = async (req, res) => {
  try {
    let bannerData = await Banner.findOne();
    res.status(200).json({ data: bannerData });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getGallery = async (req, res) => {
  try {

    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 9;
    const skip = (page - 1) * limit;

    let galleryElements = await Gallery.aggregate([
      { $match: { isActive: true } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalCount = (await Gallery.find({ isActive: true })).length;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: galleryElements,
      page,
      totalPages,
      lastPage: page < totalPages ? false : true
    });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const recentNews = async (req, res) => {
  try {
    let news = await News.aggregate([
      // {
      //   $match: {
      //     startDate: { $lte: new Date() }
      //   }
      // },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      }
    ])
    news = news.map(elem => ({
      ...elem,
      title: elem.location.split('_')[1] ? elem.title : `${elem.title.slice(0, 70)}`,
      date: moment(elem.date).format('ll'),
    }));
    res.status(200).json({ data: news });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const allNews = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    let news = await News.aggregate([
      // {
      //   $match: {
      //     startDate: { $lte: new Date() }
      //   }
      // },
      {
        $sort: { createdAt: -1 }
      },
      { $skip: skip },
      { $limit: limit },
      // {
      //   $limit: 5
      // }
    ])
    news = news.map(elem => ({
      ...elem,
      date: moment(elem.date).format('LL'),
    }));
    const totalCount = (await News.find({ isActive: true })).length;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: news,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getNews = async (req, res) => {
  try {
    const { newsId } = req.params;
    let news = await News.findOne({ newsId }).lean();
    news["date"] = moment(news.date).format('LL')
    res.status(200).json({ data: news });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const pastEvents = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    let events = await Event.aggregate([
      {
        $match: {
          startDate: { $lt: new Date() }
        }
      },
      {
        $match: {
          isActive: true
        }
      },
      { $skip: skip },
      { $limit: limit },
    ])
    events = events.map(elem => ({
      ...elem,
      startDate: moment(elem.startDate).format('ll'),
      endDate: moment(elem.endDate).format('ll'),
    }));
    events = events.map(elem => ({
      ...elem,
      date: `${elem.startDate} - ${elem.endDate}`,
    }));
    const totalCount = (await Event.find({ isActive: true, startDate: { $lt: new Date() } })).length;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: events,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getExhibitorsPage = async (req, res) => {
  try {
    const exhibitorData = await Member.aggregate([
      {
        '$addFields': {
          'event': {
            '$toObjectId': '$event'
          }
        }
      }, {
        '$lookup': {
          'from': 'events',
          'localField': 'event',
          'foreignField': '_id',
          'as': 'event'
        }
      }, {
        '$unwind': {
          'path': '$event'
        }
      }, {
        '$group': {
          '_id': '$exhibitorType',
          'exhibitors': {
            '$push': '$$ROOT'
          }
        }
      }
    ])
    res.status(200).json({ data: exhibitorData })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getExhibitors = async (req, res) => {
  try {
    const exhibitors = await Exhibitor.aggregate([
      {
        '$match': {
          'isActive': true
        }
      },
      {
        '$addFields': {
          'event': {
            '$toObjectId': '$event'
          }
        }
      }, {
        '$lookup': {
          'from': 'events',
          'localField': 'event',
          'foreignField': '_id',
          'as': 'event'
        }
      }, {
        '$unwind': {
          'path': '$event'
        }
      }, {
        '$group': {
          '_id': '$event._id',
          'event': {
            '$first': '$event.event'
          },
          'exhibitors': {
            '$push': '$$ROOT'
          }
        }
      }
    ])
    res.status(200).json({ data: exhibitors })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


module.exports = {
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
}