let obj = {}

obj.isLoggedIn = () => {  
	return (req, res, next) => {
        if (req.isAuthenticated()) return next();
        else{
            req.session.destroy();
            res.redirect('/login');
        }
	}
}

module.exports = obj;