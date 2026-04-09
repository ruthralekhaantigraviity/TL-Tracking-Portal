module.exports = (req, res) => {
    res.json({
        message: 'Vercel API is working',
        env: process.env.NODE_ENV,
        url: req.url,
        query: req.query
    });
};
