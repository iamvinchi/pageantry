// For frontend JavaScript (to be included in your views)
exports.showErrorToast = (message) => {
    if (typeof Toastify !== 'undefined') {
      Toastify({
        text: message,
        duration: 5000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ff7a65)",
        stopOnFocus: true
      }).showToast();
    } else {
      alert(message); // Fallback to alert if Toastify not loaded
    }
  }
  
  // For server-side error passing to views
  exports.withNotifications = (req, res, next) => {
    res.locals.notifications = {
      errors: req?.flash('error'),
      successes: req.flash('success')
    };
    next();
  }