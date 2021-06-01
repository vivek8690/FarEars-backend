const isUserVerified = async (req, res, next) => {
	try {
		let user = req.user;
		if (user && !user.verified) {
			return res.status(400).send({
				data: null,
				message: 'User is not verified.',
				status: false,
			});
		}
		next();
	} catch (error) {
		next(error, req, res);
	}
};

module.exports = {
	isUserVerified,
};
