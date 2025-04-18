const Contestant = require('../models/Contestant');
const { generateShareableLink } = require('../utils/helpers');
const { cloudinary } = require('../config/cloudinary');
const User = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');
const helpers = require('../utils/helpers');

const AppError = helpers.AppError

exports.addAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const user = await User.create({ name, email, password, role });

    
    res.status(201).json({
      status: 'success',
      data: { user },
      redirect:'/admin'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.cookie('token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
      });
    
  
    
    res.status(200).json({
        status: 'success',
        token,
        data: { user },
        redirect: '/admin'
      });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.protect = async (req, res, next) => {
    try {
      let token;
      if (req?.headers?.authorization && req?.headers?.authorization?.startsWith('Bearer')) {
        token = req?.headers?.authorization?.split(' ')[1];
      } else if (req?.cookies?.token) {
        token = req?.cookies?.token;
      }
      
      if (!token) {
        return res.redirect('/admin/login');
      }
      
      const decoded = await promisify(jwt?.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      
      if (!currentUser) {
        return res.redirect('/admin/login');
      }
      req.user = currentUser;
      next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            req.flash('error', 'Invalid token. Please log in again.');
          } else if (err.name === 'TokenExpiredError') {
            req.flash('error', 'Your session has expired. Please log in again.');
          } else {
            req.flash('error', 'An error occurred. Please try again.');
            return res.redirect('/admin/login');
          }
          return res.redirect('/admin/login');
    }
  };
  
  exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
      next();
    };
  };

exports.logout = (req, res) => {
    res.cookie('token', 'loggedout', {
      expires: new Date(Date.now()),
      httpOnly: true
    });
    res.status(200).redirect('/');
  };

exports.listContestants = async (req, res) => {
    try {
        let query = {};
        
        if (req.query.search) {
            query.fullName = { $regex: new RegExp(req.query.search, 'i') };
        }
        
        const contestants = await Contestant.find(query).sort({ voteCount: -1 });
        
        res.render('admin/list', { 
            contestants,
            searchQuery: req.query.search || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.showLoginForm = (req, res) => {
    res.render('admin/login');
};

exports.showSignUpForm = (req, res) => {
    res.render('admin/signup');
};

exports.showRegistrationForm = (req, res) => {
    res.render('admin/register');
};
exports.showUpdateForm = async(req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        if (!contestant) {
            return res.status(404).send('Contestant not found');
        }
        res.render('admin/updateContestant', { 
            contestant
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
    
};


exports.registerContestant = async (req, res) => {
    try {
        const { fullName, phone, age, post, bio } = req.body;

        const user = req.user

        
        if (!req.file) {
            return res.status(400).send('Please upload a photo');
        }

        const contestant = new Contestant({
            fullName,
            phone,
            age,
            post,
            bio,
            photo: req.file.path,
            photoPublicId: req.file.filename
        });

        const shareableLink = generateShareableLink();
        contestant.shareableLink = shareableLink;
        contestant.createdBy = user._id

        await contestant.save();
        
        res.redirect(`/contestants/${contestant._id}/share`);
    } catch (error) {
        console.error(error);
        
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        
        res.status(500).send('Server Error');
    }
};

exports.updateContestant = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = {
            fullName: req.body.fullName,
            phone: req.body.phone,
            age: req.body.age,
            post: req.body.post,
            bio: req.body.bio
        };

        if (req.file) {
            updateData.photo = req.file.filename;
        } else if (req.body.existingPhoto) {
            updateData.photo = req.body.existingPhoto;
        }

        await Contestant.findByIdAndUpdate(id, updateData, { new: true });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating contestant");
    }
};

exports.deleteContestant = async (req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        
        if (!contestant) {
            return res.status(404).send('Contestant not found');
        }

        if (contestant.photoPublicId) {
            await cloudinary.uploader.destroy(contestant.photoPublicId);
        }

        await Contestant.findByIdAndDelete(req.params.id);

        res.status(201).json({
            status: 'success',
            redirect: '/admin'
          });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.showShareLink = async (req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        if (!contestant) {
            return res.status(404).send('Contestant not found');
        }
        
        res.render('contestants/share', { 
            contestant,
            shareUrl: `${process.env.BASE_URL}/votes/${contestant.shareableLink}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};