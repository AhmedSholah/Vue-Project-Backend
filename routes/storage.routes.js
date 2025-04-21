const router = require("express").Router();
const { getUploadUrl, getDownloadUrl } = require("../utils/s3.utils");

router
    .route("/public/:fileName")
    .get(async function (req, res, next) {
        const fileName = req.params.fileName;
        const url = await getDownloadUrl(fileName);
        res.redirect(url);
    })
    .post(async function (req, res, next) {
        const url = await getDownloadUrl("image.png");

        res.redirect(url);
    });

router
    .route("/private/:fileName")
    .get(async function (req, res, next) {
        const fileName = req.params.fileName;
        const url = await getDownloadUrl(fileName, true);
        res.redirect(url);
    })
    .post(async function (req, res, next) {
        const url = await getUploadUrl("test.png", "image/png", true);

        res.json(url);
    });

module.exports = router;
